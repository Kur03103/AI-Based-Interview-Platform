import MistralClient from '@mistralai/mistralai';
const client = new MistralClient({ apiKey: 'test' });
console.log('client keys:', Object.keys(client));
console.log('client prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
if (client.chat) console.log('client.chat exists');
if (client.chat && client.chat.complete) console.log('client.chat.complete exists');
