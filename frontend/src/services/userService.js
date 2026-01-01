import apiClient from './api';
import { initCSRF } from './api';

const BASE = '/users/';

/**
 * Initialize CSRF token
 * @returns {Promise<void>}
 */
export async function initializeCSRF() {
  try {
    await initCSRF();
  } catch (error) {
    console.error('Error initializing CSRF token:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data
 */
export async function login(credentials) {
  const response = await apiClient.post(`${BASE}login/`, credentials);
  return response.data;
}

/**
 * Register new user
 * @param {Object} details - Registration details
 * @returns {Promise<void>}
 */
export async function register(details) {
  await apiClient.post(`${BASE}register/`, details);
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  await apiClient.post(`${BASE}logout/`);
}

/**
 * Get current user
 * @returns {Promise<Object>} User data
 */
export async function getCurrentUser() {
  const response = await apiClient.get(`${BASE}me/`);
  return response.data;
}

/**
 * Update user profile
 * @param {Object} payload - Profile data
 * @param {string} payload.first_name - First name
 * @param {string} payload.last_name - Last name
 * @returns {Promise<Object>} Updated user data
 */
export async function updateProfile(payload) {
  const response = await apiClient.put(`${BASE}me/`, payload);
  return response.data;
}

/**
 * Verify user account
 * @param {Object} payload - Verification data
 * @param {number} payload.user_id - User ID
 * @param {string} payload.user_uuid - User UUID
 * @param {string} payload.token - Verification token
 * @returns {Promise<boolean>} Success status
 */
export async function verifyAccount(payload) {
  const response = await apiClient.post(`${BASE}verify-account/`, payload);
  return response.status === 200;
}

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function resendVerification(email) {
  await apiClient.post(`${BASE}resend-verification-link/`, { email });
}

/**
 * Send password reset link
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function sendPasswordReset(email) {
  await apiClient.post(`${BASE}send-password-reset-link/`, { email });
}

/**
 * Change password
 * @param {Object} payload - Password change data
 * @param {number} payload.user_id - User ID
 * @param {string} payload.user_uuid - User UUID
 * @param {string} payload.token - Reset token
 * @param {string} payload.password - New password
 * @param {string} payload.password2 - Confirm password
 * @returns {Promise<boolean>} Success status
 */
export async function changePassword(payload) {
  const response = await apiClient.put(`${BASE}change-password/`, payload);
  return response.status === 200;
}

export default {
  initializeCSRF,
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  verifyAccount,
  resendVerification,
  sendPasswordReset,
  changePassword
};

