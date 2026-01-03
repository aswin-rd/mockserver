const express = require('express');
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

app.get('/awake', (req, res) => {
    res.json({ message: 'Server is awake' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
