import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import axios from 'axios'
import { scrollPageToTop, scrollPageToBottom } from 'puppeteer-autoscroll-down'

const lesMillsBaseURL = 'https://watch.lesmillsondemand.com'
const lesMillsProgramURL = lesMillsBaseURL + '/world-leading-programs'
//const promiseMkdir = promisify(fs.mkdirSync)

export const getProgramURLs = async () => {
    let response = await axios.get(lesMillsProgramURL)
    const $ = cheerio.load(response.data);
    const programs = $('.browse-item-link').toArray().map((o) => $(o).attr('href'))
    console.log(programs)
    return programs
}

export const getVideoURLs = async (url: string) => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();

    await page.goto(url)

    await page.setViewport({ width: 1400, height: 1000 });
    await navigationPromise;

    await pageLoader(page)

    let urls = await page.$$eval('.browse-item-link', test => {
        return test.map(t => t.getAttribute('href'));
    })
    urls.forEach(url => console.log(url))
    await browser.close();

    return urls
}

const pageLoader = async (page:puppeteer.Page) => {
    let done = false
    while(!done) {
        try{
            await scrollPageToBottom(page as any, { size: 200, delay: 250 })
            await Promise.all( [
                await page.click('.js-load-more-link'),
                page.waitForResponse( response => response.status() === 200 ), // ... wait for network
            ]);
        } catch (error) {
            done = true
        }
    }

}