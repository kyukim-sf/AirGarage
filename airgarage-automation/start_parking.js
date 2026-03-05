const { chromium } = require('playwright');

const PHONE = '7036789502';
const PIN = '449189';
const PARK_URL = `https://pay.airgarage.com/spots/LWxrQENB2n4SxkkbTvP3JL?source=webpay3&phone=${PHONE}&pin=${PIN}&phone_country_code=%2B1&rental_type=hourly`;

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

   console.log('Navigating to AirGarage parking page...');
    await page.goto(PARK_URL);
    await page.waitForTimeout(2000);

   const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.isVisible()) {
          console.log('Entering phone number...');
          await phoneInput.fill(PHONE);
          await page.locator('button:has-text("Continue")').click();
          await page.waitForTimeout(2000);
    }

   const verificationInputs = page.locator('input[inputmode="numeric"]');
    if (await verificationInputs.first().isVisible()) {
          console.log('Entering verification PIN...');
          const code = PIN;
          const inputs = await verificationInputs.all();
          for (let i = 0; i < inputs.length && i < code.length; i++) {
                  await inputs[i].fill(code[i]);
          }
          await page.locator('button:has-text("Log in")').click();
          await page.waitForTimeout(2000);
    }

   const startButton = page.locator('button:has-text("Start Parking")');
    if (await startButton.isVisible()) {
          console.log('Starting parking session...');
          await startButton.click();
          await page.waitForTimeout(3000);
          const endButton = page.locator('button:has-text("End Parking")');
          if (await endButton.isVisible()) {
                  console.log('Parking session started successfully!');
          } else {
                  console.error('Start Parking may have failed.');
                  process.exit(1);
          }
    } else {
          const endButton = page.locator('button:has-text("End Parking")');
          if (await endButton.isVisible()) {
                  console.log('A parking session is already active.');
          } else {
                  console.error('Could not find Start Parking button.');
                  process.exit(1);
          }
    }

   await browser.close();
})();
