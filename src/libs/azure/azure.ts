/**
 * Represents an Azure REST API error response.
 *
 * @property name - Always 'RestError' to identify this error type
 * @property code - Azure-specific error code (e.g., 'SecretNotFound', 'Unauthorized')
 * @property statusCode - HTTP status code of the failed request
 * @property message - Detailed error message
 */
export interface RestError {
  name: 'RestError';
  code: string;
  statusCode: number;
  message: string;
}

/**
 * Base class for Azure SDK operations with common error handling utilities.
 *
 * Provides helper methods for working with Azure SDK errors and responses.
 */
export class Azure {
  /**
   * Type guard to check if an unknown error is an Azure RestError.
   *
   * @param error - The error object to check
   *
   * @returns True if the error is a RestError, false otherwise
   *
   * @example
   * ```typescript
   * try {
   *   await azureOperation();
   * } catch (error) {
   *   if (this.isRestError(error)) {
   *     console.log(`Azure error: ${error.code}`);
   *     if (error.code === 'SecretNotFound') {
   *       // Handle missing secret
   *     }
   *   }
   * }
   * ```
   */
  isRestError(error: unknown): error is RestError {
    return error instanceof Error && error.name === 'RestError';
  }
}
