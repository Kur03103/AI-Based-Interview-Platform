
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.MISTRAL_KEY;
const filePath = 'e:/Desktop/Interview Bloom/ai-interview-platform/frontend/public/logo192.png';

async function testOCRFull() {
    try {
        console.log("Testing Pixtral Model with logo192.png...");
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');
        const mimeType = 'image/png';

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'pixtral-12b-2409',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: "What is in this image?" },
                            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64File}` } } // Corrected format
                        ]
                    }
                ]
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

testOCRFull();
