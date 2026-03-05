const https = require('https');
const fs = require('fs');

const PHONE = '7036789502';
const SPOT_ID = 1229;
const PLATE = '8GAC911';
const STATE = 'CA';

const body = JSON.stringify({
      source: 'webpay3',
      cars_list: [{ plate: PLATE, state: STATE, country: 'US' }],
      username: '+1' + PHONE,
      phone_country_code: '+1',
      phone: PHONE,
      token: null,
      start_date: null,
      end_date: null,
      spot: SPOT_ID,
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
              'Referer': 'https://pay.airgarage.com/'
      }
};

const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
              console.log('Status:', res.statusCode);
              if (res.statusCode === 200 || res.statusCode === 201) {
                        const json = JSON.parse(data);
                        console.log('Parking session started! UUID:', json.uuid);
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
