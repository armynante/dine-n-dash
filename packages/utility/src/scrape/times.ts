// import { log } from 'console';
// import puppeteer from 'puppeteer';

// const rURL = "https://resy.com/cities/ny/lords?date=2023-07-27&seats=2"
// const BUTTON_SELECTO = "ReservationButton Button Button--primary"

export default async function findTimes() {
    // const browser = await puppeteer.launch(
    //   {
    //     headless: debug === true ? false : 'new',
    //     args: ['--disable-features=IsolateOrigins', ' --disable-site-isolation-trials', '--no-sandbox'],
    //   }
    // );
    // const page = await browser.newPage();

    // await page.setViewport({
    //   width: 1920,
    //   height: 1080
    // });

    // await page.goto(url);

    // // wait to see if the .ShiftInventory__availability-message class is present
    // // if it is, then there are no times available
    // // if it is not, then there are times available

    // const noTimesAvailable = await page.$('.ShiftInventory__availability-message');
    // if (noTimesAvailable) {
    //   log('noTimesAvailable');
    //   await browser.close();
    //   return [];
    // }

    // await page.waitForSelector(`button[class='${BUTTON_SELECTO}']`);
  
    // const buttonIds = await page.$$eval(`button[class='${BUTTON_SELECTO}']`, buttons => {
    //   return buttons.map(btn => {
    //     const id = btn.id;
    //     const time = btn?.firstChild?.textContent;
    //     const type = btn?.lastChild?.textContent;
    //     return {
    //       id,
    //       time,
    //       type
    //     }
    //   });
  
    // });
    // await browser.close();
    // return buttonIds;
}
