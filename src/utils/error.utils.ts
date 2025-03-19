import { ApiErrorResponse } from '../types/api.types';

export const isApiError = (data: any): data is ApiErrorResponse => {
    return 'error' in data && 'statusCode' in data;
};

export const formatApiError = (error: ApiErrorResponse): string => {
    return `Error (${error.statusCode}): ${error.error}`;
}; 