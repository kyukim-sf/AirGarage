const { chromium } = require('playwright');

const PHONE = '7036789502';
const PIN = '449189';
const PARK_URL = `https://pay.airgarage.com/spots/LWxrQENB2n4SxkkbTvP3JL?source=webpay3&phone=${PHONE}&pin=${PIN}&phone_country_code=%2B1&rental_type=hourly`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to AirGarage to end session...');
  await page.goto(PARK_URL);
  await page.waitForTimeout(2000);

  // Step 1: Enter phone number if prompted
  const phoneInput = page.locator('input[type="tel"]');
  if (await phoneInput.isVisible()) {
    console.log('Entering phone number...');
    await phoneInput.fill(PHONE);
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(2000);
  }

  // Step 2: Enter verification code if prompted
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

  // Step 3: Click End Parking
  const endButton = page.locator('button:has-text("End Parking")');
  if (await endButton.isVisible()) {
    console.log('Ending parking session...');
    await endButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ Parking session ended successfully!');
    console.log('Current URL:', page.url());
  } else {
    console.log('ℹ️ No active parking session found — nothing to end.');
  }

  await browser.close();
})();
