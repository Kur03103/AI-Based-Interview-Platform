
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.MISTRAL_KEY;

async function testOCRModel() {
    try {
        console.log("Testing mistral-ocr-latest access...");
        const response = await fetch('https://api.mistral.ai/v1/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "mistral-ocr-latest",
                document: {
                    type: "document_url",
                    document_url: "https://arxiv.org/pdf/2201.04234" // Public PDF for testing
                }
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testOCRModel();
