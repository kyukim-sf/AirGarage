const https = require('https');
const fs = require('fs');

const SESSION_ID = process.env.AIRGARAGE_SESSION_ID;
if (!SESSION_ID) {
  console.error('Missing AIRGARAGE_SESSION_ID env var');
  process.exit(1);
}

function startParking(promoCode) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      source: 'webpay3',
      cars_list: [{ plate: '8GAC911', state: 'CA', country: 'US' }],
      username: '+17036789502',
      phone_country_code: '+1',
      phone: '7036789502',
      token: null,
      start_date: null,
      end_date: null,
      spot: 1229,
      promo: promoCode || null,
      short_term: true,
      rental_type: 'hourly',
      rate_code: null,
      ref: null
    });

    const options = {
      hostname: 'api.pay.airgarage.com',
      path: '/api/slots',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Origin': 'https://pay.airgarage.com',
        'Referer': 'https://pay.airgarage.com/',
        'Cookie': 'sessionid=' + SESSION_ID
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Try with promo code first
  console.log('Trying with promo code EQN120...');
  let result = await startParking('EQN120');
  console.log('Status:', result.status, result.body.substring(0, 200));

  if (result.status === 200 || result.status === 201) {
    const rental = JSON.parse(result.body);
    // Check if promo was actually applied
    if (rental.promo_code) {
      console.log('Promo applied! UUID:', rental.uuid);
    } else {
      console.log('Promo not applied but session started. UUID:', rental.uuid);
    }
    fs.writeFileSync('rental_uuid.txt', rental.uuid);
    return;
  }

  // Promo failed — retry without it
  console.log('Promo code failed, retrying without promo...');
  result = await startParking(null);
  console.log('Status:', result.status, result.body.substring(0, 200));

  if (result.status === 200 || result.status === 201) {
    const rental = JSON.parse(result.body);
    console.log('Parking started (no promo). UUID:', rental.uuid);
    fs.writeFileSync('rental_uuid.txt', rental.uuid);
  } else {
    console.error('Failed to start parking:', result.body);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
