const puppeteer = require("puppeteer");
const fs = require("fs");
const zlib = require("zlib");
const ndjson = require("ndjson");

// Define a class for Amazon India Scraper
class AmazonINScraper {
  constructor() {
    this.results = []; // Array to store scraped data
    this.browser = null; // Puppeteer browser instance
  }

  // Initialize the Puppeteer browser
  async initialize() {
    try {
      this.browser = await puppeteer.launch();
    } catch (error) {
      console.error("Error during initialization:", error);
      throw error;
    }
  }

  // Scrape Amazon India for laptops based on pincode
  async scrapeAmazon(pincode) {
    const page = await this.browser.newPage(); // Create a new page in the browser
    console.log(pincode);

    try {
      // Navigate to the Amazon India laptops page with the specified pincode
      await page.goto(`https://www.amazon.in/s?k=laptops&pincode=${pincode}`);
      // Extract laptop data from the page using JavaScript in the browser context
      const laptops = await page.evaluate(() => {
        const data = [];
        const laptopElements = document.querySelectorAll(".s-result-item");

        laptopElements.forEach((laptopElement) => {
          try {
            // Extract various data points for each laptop
            const sku = laptopElement.dataset.asin || "";
            const productNameElement = laptopElement.querySelector("h2 span");
            const productName = productNameElement
              ? productNameElement.innerText
              : "";

            // Extract other properties in a similar manner
            const productTitleElement = laptopElement.querySelector("h2 span");
            const productTitle = productTitleElement
              ? productTitleElement.innerText
              : "";

            const descriptionElement =
              laptopElement.querySelector(".a-size-base");
            const description = descriptionElement
              ? descriptionElement.innerText
              : "";

            const categoryElement =
              laptopElement.querySelector(".a-link-normal");
            const category = categoryElement ? categoryElement.innerText : "";

            const mrpElement = laptopElement.querySelector(
              ".a-text-price .a-offscreen"
            );
            const mrp = mrpElement ? mrpElement.innerText : "";

            const sellingPriceElement = laptopElement.querySelector(
              ".a-price .a-offscreen"
            );
            const sellingPrice = sellingPriceElement
              ? sellingPriceElement.innerText
              : "";

            const discountElement = laptopElement.querySelector(".a-offscreen");
            const discount = discountElement ? discountElement.innerText : "";

            const weightElement =
              laptopElement.querySelector(".a-text-bold span");
            const weight = weightElement ? weightElement.innerText : "";

            const brandNameElement =
              laptopElement.querySelector(".a-text-bold");
            const brandName = brandNameElement
              ? brandNameElement.innerText
              : "";

            const imageUrlElement = laptopElement.querySelector(".s-image");
            const imageUrl = imageUrlElement
              ? imageUrlElement.getAttribute("src")
              : "";

            const laptopSpecificationElement =
              laptopElement.querySelector(".a-unordered-list");
            const laptopSpecification = laptopSpecificationElement
              ? laptopSpecificationElement.innerText
              : "";

            // Construct an object with extracted data
            const laptopData = {
              SKU: sku,
              productName: productName,
              productTitle: productTitle,
              description: description,
              category: category,
              mrp: mrp,
              sellingPrice: sellingPrice,
              discount: discount,
              weight: weight,
              brandName: brandName,
              imageUrl: imageUrl,
              laptopSpecification: laptopSpecification,
              // Add other properties here
            };

            // Add the laptop data object to the array
            data.push(laptopData);
          } catch (ex) {
            console.error("Error during laptop data extraction:", ex);
          }
        });

        return data;
      });

      this.results = this.results.concat(laptops);
    } catch (error) {
      console.error("Error during scraping:", error);
    } finally {
      await page.close();
    }
  }
  // Close the Puppeteer browsers
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
  // Save scraped results to a compressed NDJSON file
  saveResults() {
    const filename = "scraped_data.ndjson.gz";
    const fileStream = fs.createWriteStream(filename);
    const gzip = zlib.createGzip();
    const ndjsonStream = ndjson.stringify();

    ndjsonStream.pipe(gzip).pipe(fileStream);

    this.results.forEach((data) => {
      ndjsonStream.write(data);
    });

    ndjsonStream.end();

    console.log(`Scraped data saved to ${filename}`);
  }
}
// Export the AmazonINScraper class for external use
module.exports = AmazonINScraper;
