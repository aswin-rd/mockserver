const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('http://localhost:3000/scrape', {
            url: 'http://localhost:8080/test.html'
        });
        console.log('Test Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

test();
