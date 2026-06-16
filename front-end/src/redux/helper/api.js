import axios from 'axios'

// for live
const instance = axios.create({
    baseURL: import.meta.env.VITE_LOCAL_LIVE_URL || 'https://www.api.wfcc.in/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to handle token dynamically
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;