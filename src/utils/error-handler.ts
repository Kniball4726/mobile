/**
 * Utilidad modular para formateo, clasificación y diagnóstico de errores en el cliente.
 * Diseñada para aplicaciones SaaS con alta mantenibilidad y consistencia de UI.
 */

export interface FormattedError {
  message: string;
  code?: string;
  status?: number;
  isNetworkError: boolean;
  isAuthError: boolean;
  isRateLimit: boolean;
}

export function parseApiError(err: unknown, defaultMessage = 'Ha ocurrido un error inesperado.'): FormattedError {
  if (!err) {
    return {
      message: defaultMessage,
      isNetworkError: false,
      isAuthError: false,
      isRateLimit: false,
    };
  }

  const errorObj = err as any;
  const status = typeof errorObj.status === 'number' ? errorObj.status : undefined;
  const code = errorObj.code || (errorObj.error && errorObj.error.code) || undefined;
  
  let rawMessage =
    errorObj.message ||
    (errorObj.error && errorObj.error.message) ||
    (typeof err === 'string' ? err : defaultMessage);

  if (rawMessage.includes('Failed to fetch') || rawMessage.includes('NetworkError') || rawMessage.includes('fetch failed')) {
    return {
      message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      code: 'NETWORK_ERROR',
      status: 0,
      isNetworkError: true,
      isAuthError: false,
      isRateLimit: false,
    };
  }

  const isAuth = status === 401 || status === 403 || code === 'UNAUTHORIZED' || code === 'FORBIDDEN';
  const isRateLimit = status === 429 || code === 'TOO_MANY_LOGIN_ATTEMPTS' || code === 'RATE_LIMIT_EXCEEDED';

  return {
    message: rawMessage,
    code,
    status,
    isNetworkError: false,
    isAuthError: isAuth,
    isRateLimit,
  };
}

export function getErrorMessage(err: unknown, defaultMessage?: string): string {
  return parseApiError(err, defaultMessage).message;
}
