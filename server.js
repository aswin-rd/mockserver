const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const { scrapeReport } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Scraping URL: ${url}`);
        const data = await scrapeReport(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape the URL', details: error.message });
    }
});

app.post('/api/fetch-question', async (req, res) => {
    const { url, questionIndex } = req.body;

    if (!url || questionIndex === undefined) {
        return res.status(400).json({ error: 'URL and questionIndex are required' });
    }

    try {
        // Extract quizId (assuming it's after /quiz/ and before ?)
        const quizIdMatch = url.match(/\/quiz\/([a-zA-Z0-9]+)/);
        if (!quizIdMatch) {
            return res.status(400).json({ error: 'Invalid URL format: Could not extract quizId' });
        }
        const quizId = quizIdMatch[1];

        const apiUrl = `https://7jfe7qtfxd.execute-api.ap-south-1.amazonaws.com/quiz/${quizId}?omr_mode=false&single_page_mode=false`;

        console.log(`Fetching quiz data from: ${apiUrl}`);
        const response = await axios.get(apiUrl);
        const quizData = response.data;

        // Flatten questions
        let allQuestions = [];
        if (quizData.question_sets) {
            for (const set of quizData.question_sets) {
                if (set.questions) {
                    allQuestions = allQuestions.concat(set.questions);
                }
            }
        }

        // 1-based index to 0-based
        const index = questionIndex - 1;

        if (index < 0 || index >= allQuestions.length) {
            return res.status(404).json({ error: `Question index ${questionIndex} out of range. Total questions: ${allQuestions.length}` });
        }

        res.json(allQuestions[index]);

    } catch (error) {
        console.error('Error in /api/fetch-question:', error.message);
        res.status(500).json({ error: 'Failed to fetch question data', details: error.message });
    }
});

app.get('/awake', (req, res) => {
    res.json({ message: 'Server is awake' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
