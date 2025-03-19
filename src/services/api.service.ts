import axios, { AxiosInstance } from "axios";
import { environment } from "../config/environment";

const api = axios.create({
	baseURL: environment.api.baseUrl,
	headers: {
		"Content-Type": "application/json",
		"X-API-KEY": environment.api.apiKey,
	},
});

export const setAuthToken = (token: string): void => {
	api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default api;
