import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure auto-retries
axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
    }
});

// Request interceptor to add JWT token
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

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor to handle errors (e.g., token expiration)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip refresh logic for auth routes (login/register) to prevent loops
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Use plain axios for refresh to avoid interceptor loop
                    const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    processQueue(null, accessToken);
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    // Clear all auth data on failed refresh
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // No refresh token available, just clean up and go to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
