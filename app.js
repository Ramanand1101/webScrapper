// main.js
// Import the AmazonINScraper class from the 'scraper' module
const AmazonINScraper = require("./scrapper");

// Create an instance of AmazonINScraper
const amazonScraper = new AmazonINScraper();

// Define an asynchronous function to run the scraper
async function runScraper() {
  try {
    // Initialize the scraper (launch Puppeteer browser)
    await amazonScraper.initialize();

    // Scrape Amazon India for laptops with the specified pin codes
    await amazonScraper.scrapeAmazon("560001");
    await amazonScraper.scrapeAmazon("110001");
  } finally {
    // Close the Puppeteer browser and save the scraped results
    await amazonScraper.closeBrowser();
    amazonScraper.saveResults();
  }
}

// Call the runScraper function to start the scraping process
runScraper();
