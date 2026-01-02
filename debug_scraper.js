const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test.html', 'utf8');
const $ = cheerio.load(html);

const subjectSection = $('#subject_peformance');
const headings = subjectSection.find('#section_heading');

headings.each((i, el) => {
    console.log('Heading:', $(el).text().trim());
    let nextNode = $(el).next();
    let count = 0;
    while (nextNode.length > 0 && nextNode.attr('id') !== 'section_heading' && count < 5) {
        console.log(`  Sibling ${count}: Tag=${nextNode[0].tagName}, ID=${nextNode.attr('id')}, Class=${nextNode.attr('class')}`);
        // If it's the score_details table, print its children
        if (nextNode.attr('id') === 'score_details') {
            console.log('    Inside score_details table children:');
            nextNode.children().each((j, child) => {
                console.log(`      Child ${j}: Tag=${child.tagName}, ID=${$(child).attr('id')}`);
                if (child.tagName === 'tbody') {
                    $(child).children().each((k, grand) => {
                        const rowText = $(grand).text().replace(/\s+/g, ' ').substring(0, 50);
                        console.log(`        GrandChild (tbody content) ${k}: Tag=${grand.tagName}, Text=${rowText}`);
                        // check for table inside row?
                        const nestedTable = $(grand).find('table');
                        if (nestedTable.length) {
                            console.log('        !!! FOUND NESTED TABLE inside TR !!!');
                        }
                    })
                }
            });

            // Helper to check if table is a direct child of table (invalid but possible in cheerio)
            const directTable = nextNode.children('table');
            if (directTable.length) console.log('    !!! FOUND DIRECT TABLE CHILD of TABLE !!!');
        }
        nextNode = nextNode.next();
        count++;
    }
});
