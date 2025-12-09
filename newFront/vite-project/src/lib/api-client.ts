// src/lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api", // Địa chỉ Backend của bạn
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Nếu bạn dùng Cookie, giữ dòng này. Nếu dùng Token Header thì có thể bỏ hoặc giữ đều được.
});

// Tự động gắn Token vào Header nếu có (quan trọng cho các route có middleware 'authenticate')
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken"); // Giả sử bạn lưu token ở localStorage khi login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
