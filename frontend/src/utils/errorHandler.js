import { parseApiErrorFields } from './parseApiError';

/**
 * Standardized error object structure
 * @typedef {Object} StandardizedError
 * @property {string} message - Human-readable error message
 * @property {Object} details - Raw error details from API
 * @property {number} status - HTTP status code
 * @property {Object} fields - Field-specific errors (from parseApiErrorFields)
 */

/**
 * Transforms an axios error into a standardized error format
 * @param {Error} error - Axios error object
 * @returns {StandardizedError} Standardized error object
 */
export function transformApiError(error) {
  const status = error.response?.status || 0;
  const responseData = error.response?.data || {};
  const fields = parseApiErrorFields(responseData);

  // Extract message from various possible locations
  let message = 'An unknown error occurred';

  if (responseData.detail) {
    message = typeof responseData.detail === 'string'
      ? responseData.detail
      : JSON.stringify(responseData.detail);
  } else if (responseData.message) {
    message = typeof responseData.message === 'string'
      ? responseData.message
      : JSON.stringify(responseData.message);
  } else if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
    message = responseData.non_field_errors.join(' ');
  } else if (fields._non_field && fields._non_field.length > 0) {
    message = fields._non_field.join(' ');
  } else if (error.message) {
    message = error.message;
  }

  // Handle specific status codes
  if (status === 401) {
    message = 'Authentication required. Please log in.';
  } else if (status === 403) {
    message = 'You do not have permission to perform this action.';
  } else if (status === 404) {
    message = 'The requested resource was not found.';
  } else if (status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'];
    message = retryAfter
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.';
  } else if (status >= 500) {
    message = 'Server error. Please try again later.';
  }

  return {
    message,
    details: responseData,
    status,
    fields,
    originalError: error
  };
}

/**
 * Creates a standardized error object from a message string
 * @param {string} message - Error message
 * @param {number} [status=0] - HTTP status code
 * @returns {StandardizedError} Standardized error object
 */
export function createError(message, status = 0) {
  return {
    message,
    details: { message },
    status,
    fields: {},
    originalError: null
  };
}

/**
 * Extracts a user-friendly error message from a standardized error
 * @param {StandardizedError|Error|Object|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.details?.message) {
    return error.details.message;
  }

  if (error.details?.detail) {
    return typeof error.details.detail === 'string'
      ? error.details.detail
      : JSON.stringify(error.details.detail);
  }

  return 'An unknown error occurred';
}

/**
 * Checks if error is a network error (no response from server)
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  return !error.response && !!error.request;
}

/**
 * Checks if error is a timeout error
 * @param {Error} error - Error object
 * @returns {boolean} True if timeout error
 */
export function isTimeoutError(error) {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
}

