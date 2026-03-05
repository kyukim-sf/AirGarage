const { chromium } = require('playwright');

const PHONE = '7036789502';
const PIN = '449189';
const DISCOUNT_CODE = 'EQN120';
const PARK_URL = `https://pay.airgarage.com/spots/LWxrQENB2n4SxkkbTvP3JL?source=webpay3&phone=${PHONE}&pin=${PIN}&phone_country_code=%2B1&rental_type=hourly`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to AirGarage parking page...');
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

  // Step 2: Enter verification code if prompted (using PIN from URL)
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

  // Step 3: Add discount code if not already applied
  const discountSection = page.locator('text=No discount code');
  if (await discountSection.isVisible()) {
    console.log('Adding discount code...');
    await page.locator('button:has-text("Add")').last().click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Enter Code"]').fill(DISCOUNT_CODE);
    await page.locator('button:has-text("Add")').last().click();
    await page.waitForTimeout(1000);
  } else {
    console.log('Discount code already applied or not needed.');
  }

  // Step 4: Click Start Parking
  const startButton = page.locator('button:has-text("Start Parking")');
  if (await startButton.isVisible()) {
    console.log('Starting parking session...');
    await startButton.click();
    await page.waitForTimeout(3000);

    // Confirm session started
    const endButton = page.locator('button:has-text("End Parking")');
    if (await endButton.isVisible()) {
      console.log('✅ Parking session started successfully!');
      console.log('Current URL:', page.url());
    } else {
      console.error('❌ Start Parking may have failed — End Parking button not found.');
      process.exit(1);
    }
  } else {
    // Maybe already in active session
    const endButton = page.locator('button:has-text("End Parking")');
    if (await endButton.isVisible()) {
      console.log('ℹ️ A parking session is already active.');
    } else {
      console.error('❌ Could not find Start Parking button.');
      process.exit(1);
    }
  }

  await browser.close();
})();
