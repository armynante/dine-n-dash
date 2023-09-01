import debugSS from "./debugSS.js";

const EMAIL = process.env.RESY_EMAIL;
const PASSWORD = process.env.RESY_PASSWORD;

const loginToResy = async (page: any, timeout:number, screenshots?:boolean) => {
  console.log('Logging in to Resy');
  if (!EMAIL || !PASSWORD) {
    throw new Error('Missing email or password');
  }
  const LOGIN_BUTTON_SELECTOR = "Button Button--login"

  await page.waitForSelector(`button[class='${LOGIN_BUTTON_SELECTOR}']`);

  await page.waitForTimeout(timeout);

  // if in debug mode save a screenshot
  
  // click the login button
  await page.click(`button[class='${LOGIN_BUTTON_SELECTOR}']`);
  await page.waitForTimeout(timeout);
  await page.waitForSelector("body > div.ReactModalPortal > div > div > div > div.AuthView > div.AuthView__Footer > button");
  
  await page.click('body > div.ReactModalPortal > div > div > div > div.AuthView > div.AuthView__Footer > button');
  await page.waitForTimeout(timeout);
  // input email and password
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);
  
  // click the submit button
  await page.click('button[type="submit"]');
  
  // wait for netowrk to idle
  await page.waitForTimeout(timeout);
  await debugSS(page, 'login', screenshots);

}

export default loginToResy;