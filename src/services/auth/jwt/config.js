import axios from 'axios';
import { baseURL } from 'config';

export default axios.create({
  // baseURL: `http://g-axon.work/jwtauth/api/`, //YOUR_API_URL HERE
  baseURL: 'http://185.170.58.172:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
