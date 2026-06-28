import { toast } from 'sonner';
import i18n from '../i18n';

const HTTP_STATUS_KEY = {
    400: 'error.http.bad_request',
    401: 'error.http.unauthorized',
    403: 'error.http.forbidden',
    404: 'error.http.not_found',
    409: 'error.http.conflict',
    422: 'error.http.validation',
};

/**
 * Resolves an unknown error to a human-readable translated string.
 *
 * Resolution order:
 *  1. Backend errorCode translated via i18n
 *  2. Backend message field (already interpolated by server, e.g. for file errors)
 *  3. HTTP status fallback key
 *  4. Generic unexpected error
 */
export function resolveError(error) {
    const data = error?.response?.data;
    const httpStatus = error?.response?.status ?? data?.code;

    // 1. Try frontend i18n translation of the backend errorCode
    const errorCode = data?.errorCode;
    if (errorCode) {
        const translated = i18n.t(errorCode, { defaultValue: '' });
        if (translated && !translated.includes('{{')) {
            return translated;
        }
        // Translation needs interpolation params we don't have — use server message
        if (data?.message) {
            return data.message;
        }
    }

    // 2. HTTP status key
    if (httpStatus && HTTP_STATUS_KEY[httpStatus]) {
        return i18n.t(HTTP_STATUS_KEY[httpStatus]);
    }
    if (httpStatus >= 500) {
        return i18n.t('errors.server');
    }

    // 3. Network error (no response)
    if (!error?.response) {
        return i18n.t('errors.network');
    }

    // 4. Generic fallback
    return i18n.t('error.http.unexpected');
}

export function toastError(error) {
    toast.error(resolveError(error));
}

export function toastSuccess(messageKey, interpolationParams = {}) {
    toast.success(i18n.t(messageKey, interpolationParams));
}
