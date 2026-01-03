import express from 'express';
import multer from 'multer';
import cors from 'cors';

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Initialize Mistral client - Removed in favor of raw fetch

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images are allowed.'));
        }
    }
});

// Hard-coded OCR prompt
const OCR_PROMPT = `Extract all visible text from this document exactly as it appears.
Do not summarize.
Do not infer or hallucinate missing content.
Preserve original wording, order, and line breaks.
Return only the extracted text.`;

// OCR extraction endpoint
app.post('/api/ocr/extract', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;

        // Read file as base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');

        // Determine MIME type
        const mimeType = req.file.mimetype;

        console.log('Starting OCR request...');
        console.log('API Key present:', !!process.env.MISTRAL_KEY);

        const payload = {
            model: 'pixtral-12b-2409',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: OCR_PROMPT },
                        { type: 'image_url', imageUrl: `data:${mimeType};base64,${base64File.substring(0, 50)}...` }
                    ]
                }
            ]
        };
        console.log('Payload structure:', JSON.stringify(payload, null, 2));

        // Call Mistral OCR via raw fetch
        const response = await fetch('https://api.mistral.ai/v1/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-ocr-latest',
                document: {
                    type: 'document_url',
                    document_url: `data:${mimeType};base64,${base64File}`
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        console.log('Mistral Response:', JSON.stringify(data, null, 2));
        fs.writeFileSync('ocr_debug.log', JSON.stringify(data, null, 2));

        // Extract text from response (combine markdown from all pages)
        let extractedText = '';
        if (data.pages && Array.isArray(data.pages)) {
            extractedText = data.pages.map(page => page.markdown).join('\n\n');
        } else {
            // Fallback if structure is different
            extractedText = JSON.stringify(data);
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        // Return extracted text
        res.json({ text: extractedText });

    } catch (error) {
        console.error('OCR Error:', error);
        const errorLog = `Error Name: ${error.name}\nError Message: ${error.message}\nStack: ${error.stack}\nFull Error: ${JSON.stringify(error, null, 2)}`;
        fs.writeFileSync('ocr_error_plain.txt', errorLog);

        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('File cleanup error:', unlinkError);
            }
        }

        let status = 500;
        let errorMessage = 'Failed to extract text from document';

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            status = 401;
            errorMessage = 'Invalid Mistral API Key. Please check your backend .env file.';
        } else if (error.message.includes('400')) {
            status = 400;
            errorMessage = 'Bad Request. The file might be corrupted or the model is unavailable.';
        }

        res.status(status).json({
            error: errorMessage,
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'OCR service is running' });
});

app.listen(PORT, () => {
    console.log(`OCR backend running on http://localhost:${PORT}`);
});
