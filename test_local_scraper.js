const { scrapeReport } = require('./scraper');

async function run() {
    try {
        const data = await scrapeReport('http://localhost:8080/test.html');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
