import axios from "axios";


//it provides dummy json base url,json header (simply- single shared Axios setup)
const api = axios.create({
    baseURL: "https://dummyjson.com",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(
                "API Error:",
                error.response.status,
                error.response.data
            );
        } else {
            console.error("Network Error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;