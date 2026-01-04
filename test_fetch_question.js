const axios = require('axios');

async function testFetchQuestion() {
    try {
        const response = await axios.post('http://localhost:3000/api/fetch-question', {
            url: "https://quiz.avantifellows.org/quiz/69491fbd3479bedb4e878c02?userId=2631206382",
            questionIndex: 1
        });
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testFetchQuestion();
