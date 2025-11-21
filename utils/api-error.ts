import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function isUnexpectedError(error: FetchBaseQueryError): boolean {
  const { status } = error;

  // network errors (FETCH_ERROR, TIMEOUT_ERROR, PARSING_ERROR, etc.)
  if (typeof status === 'string') {
    return true; // All network errors are unexpected
  }

  // server errors (5xx)
  if (typeof status === 'number' && status >= 500) {
    return true;
  }

  // 4xx
  return false;
}

/**
 * Gets a user-friendly error message for unexpected errors
 */
export function getUnexpectedErrorMessage(error: FetchBaseQueryError): string {
  const { status } = error;

  // Network errors
  if (typeof status === 'string') {
    switch (status) {
      case 'FETCH_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.';
      case 'PARSING_ERROR':
        return 'Unable to process server response.';
      default:
        return 'Network error. Please try again.';
    }
  }

  // server errors (5xx)
  if (typeof status === 'number') {
    switch (status) {
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      case 504:
        return 'Request timed out. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  return 'An unexpected error occurred.';
}

/**
 * Type guard for FetchBaseQueryError
 */
export function isFetchBaseQueryError( // this can be used in the components to predict properties
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}
