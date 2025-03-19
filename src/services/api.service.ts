import axios, { AxiosInstance } from "axios";
import { environment } from "../config/environment";

// Create a single axios instance
const api = axios.create({
	baseURL: environment.api.baseUrl,
	headers: {
		"Content-Type": "application/json",
		"X-API-KEY": environment.api.apiKey,
	},
});

// Set auth token function
export const setAuthToken = (token: string): void => {
	api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Export the axios instance directly
export default api;
