import MistralClient from '@mistralai/mistralai';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.MISTRAL_KEY;
console.log(`Key loaded: '${key ? key.substring(0, 5) + '...' + key.substring(key.length - 5) : 'undefined'}' len=${key ? key.length : 0}`);
const client = new MistralClient({ apiKey: key });

async function testKey() {
    try {
        console.log("Testing Mistral API Key with mistral-tiny...");
        const chatResponse = await client.chat({
            model: 'mistral-tiny',
            messages: [{ role: 'user', content: 'Hello' }]
        });
        console.log("Success! Response:", chatResponse.choices[0].message.content);
    } catch (error) {
        console.error("Failed text chat:", error.message);
    }
}

testKey();
