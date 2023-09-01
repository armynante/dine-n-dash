// import puppeteer from 'puppeteer';
// import fs from 'fs';
// import { log } from 'console';
// import { Watcher } from '../types';
// import loginToResy from './shared/login';

// interface BookingRequest {
//   resyId: string;
//   slug: string;
//   city: string;
//   timeout?: number;
//   seats: number;
//   startTime: string;
//   endTime: string;
//   startDate: string;
//   endDate: string;
//   debug?: boolean;
// }


export default async function bookTable(request:any, debug?:boolean) {

  // const TIMEOUT = 2000;
  // const browser = await puppeteer.launch(
  //   {
  //     headless: debug ? false : 'new',
  //     args: ['--disable-features=IsolateOrigins', ' --disable-site-isolation-trials', '--no-sandbox'],
  //   }
  // );
  // const page = await browser.newPage();

  // await page.setViewport({
  //   width: 1920,
  //   height: 1080
  // });

  // const url = `https://resy.com/cities/${request.restaurant.city}/${request.restaurant.slug}?date=${request.date}&seats=${request.seats}`
  // await page.goto(url);

  // await loginToResy(page, TIMEOUT);

  
  // // await page.waitForSelector(`button[id='${bookingRequest.bookingID}']`);

  
  // // await page.click(`button[id='${bookingRequest.bookingID}']`)

  // await page.waitForTimeout(TIMEOUT);

  // // focus on the modal
  // //loop through all the iframes on the page and print their src
  // let modalUrl;
  // const frames = await page.frames();
  // for (let i = 0; i < frames.length; i++) {
  //   const frame = frames[i];
  //   const url = frame.url();
  //   console.log(url);
  //   if (url.includes('widgets.resy.com')) {
  //     modalUrl = url;
  //     fs.appendFileSync('progress.log', url + '\n');

  //     break;
  //   }
  // }

  // if (!modalUrl) {
  //   throw new Error('Modal not found');
  // }

  // // navigate to the modal
  // await page.goto(modalUrl);

  // // wait 10 seconds for the modal to load
  // await page.waitForTimeout(TIMEOUT);

  // // print the modal content
  // const modalContent = await page.content();
  // console.log(modalContent);
 

  // await browser.close();
  // return modalContent;
}