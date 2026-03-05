const https = require('https');
const fs = require('fs');

const SESSION_ID = process.env.AIRGARAGE_SESSION_ID;
if (!SESSION_ID) {
  console.error('Missing AIRGARAGE_SESSION_ID environment variable');
  process.exit(1);
}

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
  promo: null,
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
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200 || res.statusCode === 201) {
      const json = JSON.parse(data);
      console.log('Parking started! UUID:', json.uuid);
      fs.writeFileSync('rental_uuid.txt', json.uuid);
    } else {
      console.error('Failed to start parking:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
  process.exit(1);
});

req.write(body);
req.end();
