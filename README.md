# WebCrawler
A Webcrawler

## What is it doing?
This WebCrawler is my first project in TypeScript and it can find and watch websites on its own. You give it a start URL and it visits it and searches the html for <a> tags with a href attribute.
It then puts every found URL in a queue and visits the next one, and the cicle continues where the WebCrawler does the same for all other found URLS. It writes a log about every URL it has
visited and it gives you stats about the queue or the speed of the Crawler. After the Crawler visited a few URLS, you can use the getimg.ts script to download every image of every URL scraped (as a
little gimmick).

## Why?
It is a great and fun way to spend time in a video call. You ask your friends for a website, you start the Crawler and at the end you can se every image from site, which is often very fun and
entertaining. The Crawler can get from a News site to the declaration of independence if you are lucky. Everything is possible.

## How to use...
### 1. Install all NPM
1. Download NPM from their guide: https://docs.npmjs.com/cli/v10/commands/npm-install
   or
1. You use the NVM (Node Version Manager) from: https://github.com/coreybutler/nvm-windows

### 2. Clone repository
1. Use `git clone https://github.com/LuisSchuimer/WebCrawler.git`
or
1. Download the repository as a ZIP-Arcive  

### 3. Install dependencies
1. Run `npm install` or `npm i` in your terminal

### 4. Run the Crawler
1. Replace the sample URL with the one you want to start with (IMPORTANT: There needs to be `https://` before the URL if there is none)
3. Run `npx esrun main.ts` in your terminal

### 5. Run the Image Downloader (Optional)
1. Run `npx esrun getimg.ts` in your terminal
