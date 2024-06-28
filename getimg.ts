import * as fs from 'fs';
import * as readline from 'readline';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as urlModule from 'url';

// Read the text file line by line
async function readLinesFromFile(filePath: string): Promise<string[]> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
        lines.push(line);
    }
    return lines;
}

// Extract URLs from each line
function extractUrls(lines: string[]): string[] {
    const urls: string[] = [];
    const urlPattern = /Got: (https?:\/\/[^\s]+)/;
    for (const line of lines) {
        const match = line.match(urlPattern);
        if (match && match[1]) {
            urls.push(match[1]);
        }
    }
    return urls;
}

// Fetch HTML content from a URL
async function fetchHtml(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
}

// Extract image URLs from HTML content
function extractImageUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const imageUrls: string[] = [];
    $('img').each((_, img) => {
        let src = $(img).attr('src');
        if (src) {
            src = new urlModule.URL(src, baseUrl).href; // Resolve relative URLs
            imageUrls.push(src);
        }
    });
    return imageUrls;
}

// Download an image and save it to the specified folder
async function downloadImage(url: string, folder: string): Promise<void> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const filename = path.basename(urlModule.parse(url).pathname || '');
        const filePath = path.join(folder, filename);
        fs.writeFileSync(filePath, response.data);
    } catch (error) {
        console.error(`Failed to download image ${url}:`, error.message);
    }
}

// Main function
async function main() {
    const filePath = 'log.txt'; // Path to your text file
    const downloadFolder = 'images'; // Folder to save images

    // Create download folder if it doesn't exist
    if (!fs.existsSync(downloadFolder)) {
        fs.mkdirSync(downloadFolder);
    }

    const lines = await readLinesFromFile(filePath);
    const urls = extractUrls(lines);

    console.log(`Found ${urls.length} URLs to process.`);

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`Processing ${i + 1}/${urls.length}: ${url}`);
        try {
            const html = await fetchHtml(url);
            const imageUrls = extractImageUrls(html, url);
            console.log(`Found ${imageUrls.length} images.`);

            for (const imageUrl of imageUrls) {
                await downloadImage(imageUrl, downloadFolder);
            }
        } catch (error) {
            console.error(`Failed to fetch or process ${url}:`, error.message);
        }
    }
}

main().catch(error => console.error('Error in main function:', error));
