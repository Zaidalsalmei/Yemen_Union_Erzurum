import axios from "axios";

export const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// ✅ Interceptor adding token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Interceptor handling 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Avoid loops on login/refresh routes
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) throw new Error("No refresh token");

                // Use raw axios to avoid interceptor loop
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken
                });

                if (res.data.success) {
                    const newToken = res.data.data.access_token;
                    localStorage.setItem("access_token", newToken);

                    // Update header and retry
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed or no token - force logout
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                // Only redirect if absolutely necessary, AuthContext should handle state
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
