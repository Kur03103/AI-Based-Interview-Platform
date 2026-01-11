import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../frontend/public/logo192.png');

async function testOCR() {
    try {
        console.log(`Reading file from ${filePath}`);
        if (!fs.existsSync(filePath)) {
            console.error('File not found!');
            return;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer], { type: 'image/png' });

        const formData = new FormData();
        formData.append('file', blob, 'logo192.png');

        console.log('Sending request to http://localhost:5000/api/ocr/extract');
        const response = await fetch('http://localhost:5000/api/ocr/extract', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testOCR();
