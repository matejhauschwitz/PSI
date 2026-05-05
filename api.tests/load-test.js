import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // Rychlejší náběh
    { duration: '40s', target: 10 }, // Stabilní zátěž
    { duration: '10s', target: 0 },  // Odpojení
  ],
  thresholds: {
    http_req_failed: ['rate<0.03'], 
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const baseUrl = __ENV.K6_BASE_URL;
  
  // --- TEST 1: SEZNAM KNIH ---
  const resAll = http.get(`${baseUrl}/books`);
  
  const checkResAll = check(resAll, {
    'GET books - status 200': (r) => r.status === 200,
  });

  if (checkResAll) {
    check(resAll, {
      'GET books - obsahuje pole': (r) => Array.isArray(r.json()),
    });
  }

  sleep(1);

  // --- TEST 2: DETAIL KNIHY ---
  const resOne = http.get(`${baseUrl}/books/1`);
  check(resOne, {
    'GET book detail - status 200 nebo 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}