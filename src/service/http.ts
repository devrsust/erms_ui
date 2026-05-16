import axios from "axios";
import { store } from "@/store";

const http = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
    timeout: 30000,
});

http.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    const user = store.getState().auth.user;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.id) {
        config.headers["user"] = String(user);
    }

    return config;
});

export default http;