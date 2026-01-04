const fs = require('fs');
const { scrapeReport } = require('./scraper');

async function run() {
    try {
        const data = await scrapeReport('http://localhost:8080/test.html');
        fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
        console.log('Output written to output.json');
    } catch (e) {
        console.error(e);
    }
}
run();
