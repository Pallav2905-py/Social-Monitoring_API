const puppeteer = require('puppeteer');

const socialAccountSearcher = async (url, selectors) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Mapping of selectors to desired key names
        const keyMap = {
            ".gs-title": "Title",
            // ".rezults-item-user__info": "date",
            ".gs-snippet": "messageBody",
            ".gs-bidi-start-align gs-visibleUrl": "link"
        };

        // Initialize an object to store the results for each selector
        let results = {};

        for (const selector in selectors) {
            try {
                // Wait for the selector to load without a timeout
                await page.waitForSelector(selector);

                // Extract data including content from ::after pseudo-element
                const data = await page.evaluate((selector) => {
                    const elements = document.querySelectorAll(selector);
                    return Array.from(elements).map(element => {
                        const pseudoElementContent = window.getComputedStyle(element, '::after').content;
                        const textContent = element.textContent.trim();
                        return `${textContent} ${pseudoElementContent.replace(/"/g, '')}`.trim();
                    });
                }, selector);

                results[keyMap[selector]] = data;
            } catch (error) {
                console.warn(`Warning: Error occurred for selector ${selector}`);
                results[keyMap[selector]] = []; // If there's an error, set an empty array
            }
        }

        // Combine the data into a single array of objects
        const maxLength = Math.max(...Object.values(results).map(data => data.length));

        let combinedData = [];
        for (let i = 0; i < maxLength; i++) {
            let combinedItem = {};
            for (const key in keyMap) {
                const resultKey = keyMap[key];
                combinedItem[resultKey] = results[resultKey][i] || "none";
            }
            combinedData.push(combinedItem);
        }

        await browser.close();
        return combinedData;
    } catch (error) {
        console.error('Error scraping data:', error);
        return null;
    }
}

// // Example usage
const url = 'https://www.social-searcher.com/google-social-search/?q=pallav';
const selectors = [".gs-title", ".gs-snippet", ".gs-bidi-start-align"];  // Replace with your CSS selectors

async function main() {
    const data = await socialAccountSearcher(url, selectors);
    console.log(JSON.stringify(data, null, 2));
}

main();

// module.exports = { socialAccountSearcher }
