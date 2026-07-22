import apiClient from '../../axiosConfig.js';

// Authenticated — start the demo → paid upgrade. The backend applies the
// 14-day trial server-side and returns a Stripe Checkout URL to redirect to.
export const upgradeSubscription = (priceId) =>
    apiClient.post('/subscriptions/upgrade', { priceId });
