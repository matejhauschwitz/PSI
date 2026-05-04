import http from 'k6/http';
import { sleep, check } from 'k6';

export default function () {
  const url = __ENV.K6_BASE_URL || 'http://localhost:5000';
  
  const res = http.get(`${url}/api/books`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}