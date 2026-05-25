import axios from 'axios';
import apiClient from '../../axiosConfig.js';

export const registerUser = (data) =>
    apiClient.post('/registrations/user', data);

export const getProducts = () =>
    axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/registrations/products`);

export const createCheckoutSession = ({ tenantId, userId, priceId }) =>
    apiClient.post('/registrations/checkout-session', { tenantId, userId, priceId });
