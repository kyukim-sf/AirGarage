const https = require('https');

const PHONE = '7036789502';

function getActiveRental() {
    return new Promise((resolve, reject) => {
          const options = {
                  hostname: 'api.pay.airgarage.com',
                  path: '/api/slots?phone=' + PHONE + '&active=true',
                  method: 'GET',
                  headers: {
                            'Origin': 'https://pay.airgarage.com',
                            'Referer': 'https://pay.airgarage.com/'
                  }
          };
          const req = https.request(options, (res) => {
                  let data = '';
                  res.on('data', chunk => data += chunk);
                  res.on('end', () => {
                            console.log('GET active rental status:', res.statusCode, data);
                            try {
                                        const json = JSON.parse(data);
                                        const rental = Array.isArray(json) ? json[0] : json;
                                        resolve(rental && rental.uuid ? rental.uuid : null);
                            } catch(e) { resolve(null); }
                  });
          });
          req.on('error', reject);
          req.end();
    });
}

function endRental(uuid) {
    return new Promise((resolve, reject) => {
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
                                        resolve();
                            } else {
                                        reject(new Error('Status ' + res.statusCode + ': ' + data));
                            }
                  });
          });
          req.on('error', reject);
          req.write(body);
          req.end();
    });
}

(async () => {
    console.log('Looking up active rental...');
    const uuid = await getActiveRental();
    if (!uuid) {
          console.log('No active rental found — nothing to end.');
          process.exit(0);
    }
    console.log('Found active rental UUID:', uuid);
    await endRental(uuid);
})();
