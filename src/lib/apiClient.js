import axios from 'axios';

/**
 * API Client for dineAR Frontend
 * Centralized HTTP client with automatic JWT token handling
 */

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Request Interceptor
 * Automatically attach JWT token to requests if available
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handle common error cases and transform responses
 */
apiClient.interceptors.response.use(
    (response) => {
        // Return data directly from successful responses
        return response.data;
    },
    (error) => {
        // Handle errors consistently
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error || 'An error occurred';

            // Auto-logout on 401 (unauthorized)
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                // Optionally redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            return Promise.reject({
                message: errorMessage,
                status: error.response.status,
                details: error.response.data?.details
            });
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0
            });
        }
    }
);

/**
 * Authentication API
 */
export const authAPI = {
    /**
     * Sign up new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and token
     */
    signup: async (email, password) => {
        const response = await apiClient.post('/auth/signup', { email, password });
        if (response.data?.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and token
     */
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        if (response.data?.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    },

    /**
     * Logout user (client-side)
     */
    logout: () => {
        localStorage.removeItem('authToken');
    },

    /**
     * Get current user info
     * @returns {Promise<Object>} User data
     */
    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if token exists
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};

/**
 * Dish API
 */
export const dishAPI = {
    /**
     * Get all dishes for current user
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated dishes
     */
    list: async (page = 1, limit = 20) => {
        const response = await apiClient.get('/dishes', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Get single dish by ID
     * @param {string} id - Dish ID
     * @returns {Promise<Object>} Dish data
     */
    get: async (id) => {
        const response = await apiClient.get(`/dishes/${id}`);
        return response.data;
    },

    /**
     * Create new dish
     * @param {Object} dishData - Dish data object
     * @param {string} dishData.name - Dish name
     * @param {string} dishData.plateSize - Plate size (small/medium/large)
     * @param {File} image - Image file
     * @returns {Promise<Object>} Created dish
     */
    create: async (dishData, image) => {
        const formData = new FormData();
        formData.append('name', dishData.name);
        formData.append('plateSize', dishData.plateSize);
        formData.append('image', image);

        const response = await apiClient.post('/dishes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Update existing dish
     * @param {string} id - Dish ID
     * @param {Object} dishData - Updated dish data
     * @param {File} image - New image file (optional)
     * @returns {Promise<Object>} Updated dish
     */
    update: async (id, dishData, image = null) => {
        const formData = new FormData();

        if (dishData.name) formData.append('name', dishData.name);
        if (dishData.plateSize) formData.append('plateSize', dishData.plateSize);
        if (image) formData.append('image', image);

        const response = await apiClient.put(`/dishes/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Delete dish
     * @param {string} id - Dish ID
     * @returns {Promise<Object>} Success message
     */
    delete: async (id) => {
        const response = await apiClient.delete(`/dishes/${id}`);
        return response;
    }
};

export default apiClient;
