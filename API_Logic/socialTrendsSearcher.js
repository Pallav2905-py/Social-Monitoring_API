const puppeteer = require('puppeteer');
require("dotenv").config()

const socialTrendsSearcher = async (url) => {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });
    const selectors = [".rezults-item-user__name", ".rezults-item-user__info", ".rezults-item-text", ".rezults-item-text__url"];
    try {
        // const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Mapping of selectors to desired key names
        const keyMap = {
            ".rezults-item-user__name": "name",
            ".rezults-item-user__info": "date",
            ".rezults-item-text": "messageBody",
            ".rezults-item-text__url": "link"
        };

        // Initialize an object to store the results for each selector
        let results = {};

        for (const selector in keyMap) {
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
    } finally {
        await browser.close();

    }
}

// // Example usage
// const url = 'https://www.social-searcher.com/social-trends/?q7=hacking';
// const selectors = [".rezults-item-user__name", ".rezults-item-user__info", ".rezults-item-text", ".rezults-item-text__url"];  // Replace with your CSS selectors

// async function main() {
//     const data = await socialTrendsSearcher(url, selectors);
//     console.log(JSON.stringify(data, null, 2));
// }

// main();

module.exports = { socialTrendsSearcher }
