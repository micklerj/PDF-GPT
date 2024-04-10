const axios = require('axios');

const apiKey = 'api-key';

async function generateChatCompletion() {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                messages: [{ role: 'system', content: 'Say this is a test.' }],
                model: 'gpt-3.5-turbo',
                max_tokens: 20,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );

        console.log(response.data.choices[0]);
    } catch (error) {
        console.error('Error:', error.response.data);
    }
}

generateChatCompletion();
