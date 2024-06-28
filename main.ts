import axios from "axios";
import * as cheerio from "cheerio";
import { appendFile } from "fs";


let line: string[] = [];
let watched: string[] = [];
let buffer: string[] = []
let removed: string[] = [];
let error: string[] = [];


function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
    // Erstellen einer neuen Promise, die nach ms Millisekunden abgelehnt wird
    const timeout = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error(`Timeout after ${ms}ms`));
        }, ms);
    });

    // Race die übergebene Promise gegen die Timeout-Promise
    return Promise.race([promise, timeout]);
}

async function scrapeHrefAttributesFromWebsite(url: string): Promise<string[]> {
    try {
        
        // Fetch the webpage content
        const response = await timeoutPromise(axios.get(url), 1000);
        // Load the fetched HTML content into Cheerio
        const $ = cheerio.load(response.data);
        
        // Select all <a> tags and extract href attributes
        const links = $('a'); // Adjust the selector as needed
        const hrefs: string[] = [];

        links.each((_, link) => {
            const href = $(link).attr('href');
            if (href) {
                if (href.includes("https://")) {
                    hrefs.push(href);
                } else {
                    hrefs.push(getBaseUrl(url) + href);
                }
            }
        });

        return hrefs;
    } catch (err) {
        error.push(url);
        return [];
    }
}


function getBaseUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    } catch (error) {
        return '';
    }
}


try {
// Example usage
    (async () => {
        const url = 'https://jugendhackt.org';
        const hrefs = await scrapeHrefAttributesFromWebsite(url);
        let newSec;
        let timeCount;
        let rate = 0;

        hrefs.forEach(element => {
            if (url !== element) {
                line.push(element);
            }
        });

        console.log(`${line.length}`);

        while (line.length !== 0 || buffer.length !== 0) {
            // Wait for the async function to complete
            const currentUrl = line.shift(); // Get and remove the first element from the line array
            if (!currentUrl) continue;
            try {
                if (!watched.includes(currentUrl)) {
                    const hrefs = await scrapeHrefAttributesFromWebsite(currentUrl)
                    hrefs.forEach(element => {
                        if (url != element) {
                            if (!watched.includes(element)) {
                                line.push(element);
                            }else {
                                removed.push(element);
                            }
                        }
                    });

                    line.forEach((element) => {
                        if (watched.includes(element)) {
                            line.splice(line.indexOf(element), 1);
                            removed.push(element);
                        }
                    });

                    if (line.length >= 5000) {
                        line.forEach((element) => {
                            buffer.push(element)
                        })
                        line = [];

                        
                        while (line.length <= 200) {
                            let buffer_url: string = buffer.shift();
                            line.push(buffer_url);
                        }
                    } else if (line.length == 0) {

                        while (line.length <= 200) {
                            let buffer_url: string = buffer.shift();
                            line.push(buffer_url);
                        }
                    }
        
                    
                    watched.push(currentUrl);
                    appendFile("log.txt", `${line.length} in active queue; ${buffer.length} in buffer; ${watched.length} watched; ${removed.length} removed; ${removed.length + watched.length} processed; ${error.length} with errors; Base: ${getBaseUrl(currentUrl)}: Got: ${currentUrl} \n`, function(err) {
                        if (err) {
                            // append failed
                        } else {
                            // done
                            console.log(`${rate} WpS; ${line.length} in active queue; ${buffer.length} in buffer; ${watched.length} watched; ${removed.length} removed; ${removed.length + watched.length} processed; ${error.length} with errors (${Math.round(error.length / watched.length)}%); Base: ${getBaseUrl(currentUrl)}`);
                        }

                    });

                    let seconds = new Date
                    
                    if (seconds.getSeconds() != newSec) {
                        newSec = seconds.getSeconds();
                        rate = timeCount;
                        timeCount = 0;
                    } else {timeCount += 1;}

                }else {
                    removed.push(currentUrl);
                }
            } catch (err) {
                error.push(currentUrl)
                continue;
            }
        }
    })();

}catch (err) {
    // error
}

export {}
