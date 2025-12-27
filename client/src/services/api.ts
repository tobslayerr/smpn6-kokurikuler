import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backendkokurikuler.labkomputersmpn6pekalongan.my.id/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
