const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeReport(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const report = {
            studentId: '',
            testDetails: {},
            overallPerformance: {},
            subjectPerformance: []
        };

        // 1. Student ID
        const nameCardText = $('#name_card p').text().trim();
        report.studentId = nameCardText.replace('Student ID:', '').trim();

        // 2. Test Summary
        const testSummary = $('#test_summary_card');
        report.testDetails = {
            percentage: testSummary.find('.percentage').text().trim(),
            name: testSummary.find('.test_details div').eq(0).text().trim(),
            date: testSummary.find('.test_details div').eq(1).text().trim()
        };

        // 3. Overall Performance
        const overallSection = $('#overall_performance');
        const overallTable = overallSection.find('#score_details');
        const overallData = {};
        overallTable.find('tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length === 2) {
                const key = $(cols[0]).text().trim();
                const value = $(cols[1]).text().trim();
                overallData[key] = value;
            }
        });
        report.overallPerformance = overallData;

        // 4. Subject Performance
        const subjectSection = $('#subject_peformance');
        const headings = subjectSection.find('#section_heading');

        headings.each((i, el) => {
            const headingText = $(el).text().trim();
            const subjectName = headingText.replace('Performance - ', '').trim();

            const subjectData = {
                subject: subjectName,
                stats: {},
                chapters: []
            };

            let nextNode = $(el).next();
            // Iterate until next heading or end of siblings
            while (nextNode.length > 0 && nextNode.attr('id') !== 'section_heading') {

                // A. Check if this node is the score_details table
                if (nextNode.is('#score_details')) {
                    // Extract Stats
                    nextNode.find('> tbody > tr, > tr').each((j, row) => {
                        const cols = $(row).find('> td');
                        if (cols.length === 2) {
                            const key = $(cols[0]).text().trim();
                            const val = $(cols[1]).text().trim();
                            // Avoid rows that contain nested tables
                            if (key && $(cols[1]).find('table').length === 0) {
                                subjectData.stats[key] = val;
                            }
                        }
                    });

                    // Check for nested chapter_details (if Cheerio kept it inside)
                    let chapterTable = nextNode.find('#chapter_details');
                    if (chapterTable.length > 0) {
                        chapterTable.find('tr').each((k, row) => {
                            const cols = $(row).find('td');
                            if (cols.length >= 4) {
                                const cName = $(cols[0]).text().trim();
                                if (cName && cName !== 'Chapter') {
                                    subjectData.chapters.push({
                                        chapter: cName,
                                        score: $(cols[1]).text().trim(),
                                        accuracy: $(cols[2]).text().trim(),
                                        attemptRate: $(cols[3]).text().trim()
                                    });
                                }
                            }
                        });
                    }
                }

                // B. Check if the current node is ITSELF the chapter_details table (sibling case)
                if (nextNode.is('#chapter_details')) {
                    let cTable = nextNode;
                    cTable.find('tr').each((k, row) => {
                        const cols = $(row).find('td');
                        if (cols.length >= 4) {
                            const cName = $(cols[0]).text().trim();
                            if (cName && cName !== 'Chapter') {
                                subjectData.chapters.push({
                                    chapter: cName,
                                    score: $(cols[1]).text().trim(),
                                    accuracy: $(cols[2]).text().trim(),
                                    attemptRate: $(cols[3]).text().trim()
                                });
                            }
                        }
                    });
                }

                nextNode = nextNode.next();
            }

            report.subjectPerformance.push(subjectData);
        });

        return report;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
}

module.exports = { scrapeReport };
