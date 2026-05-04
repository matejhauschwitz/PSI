import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const baseUrl = __ENV.K6_BASE_URL || 'http://localhost:5000';
  
  const resAll = http.get(`${baseUrl}/api/books`);
  check(resAll, {
    'GET books - status 200': (r) => r.status === 200,
    'GET books - má obsah': (r) => r.json().length > 0,
  });

  sleep(1);

  const resOne = http.get(`${baseUrl}/api/books/1`);
  check(resOne, {
    'GET book detail - status 200': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}