export interface ApiErrorResponse {
    message: Record<string, unknown>;
    statusCode: number;
    error: string;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
} 