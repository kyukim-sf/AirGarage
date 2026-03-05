const https = require('https');
const fs = require('fs');

// UUID is written by start_parking.js and passed via artifact
const uuidFile = 'rental_uuid.txt';

if (!fs.existsSync(uuidFile)) {
      console.log('No rental_uuid.txt found — no active session to end.');
      process.exit(0);
}

const uuid = fs.readFileSync(uuidFile, 'utf8').trim();
console.log('Ending rental UUID:', uuid);

const body = '{}';
const options = {
      hostname: 'api.pay.airgarage.com',
      path: '/api/slots/' + uuid + '/',
      method: 'DELETE',
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
              console.log('DELETE status:', res.statusCode, data);
              if (res.statusCode === 200 || res.statusCode === 204) {
                        console.log('Parking session ended!');
              } else {
                        console.error('Failed to end parking:', data);
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
