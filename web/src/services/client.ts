import axios from 'axios';
import { transformDates } from '@/interceptors/date_parser_interceptor';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  transformResponse: [
    transformDates,
    ...(axios.defaults.transformResponse as [])
  ]
});