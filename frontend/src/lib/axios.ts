import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  // headers: { "Content-Type": "application/json" },
});

// Request Interceptor — đọc token từ localStorage (persist lưu ở đây)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      // Zustand persist lưu dạng JSON string với key 'kai-auth'
      const storage = localStorage.getItem("kai-auth");
      if (storage) {
        const { state } = JSON.parse(storage);
        const token = state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor — xử lý refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy refreshToken từ localStorage
        const storage = localStorage.getItem("kai-auth");
        if (!storage) throw new Error("No storage");

        const { state } = JSON.parse(storage);
        const refreshToken = state?.refreshToken;
        if (!refreshToken) throw new Error("No refresh token");

        // Gọi API refresh
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const tokens = response.data;

        // Cập nhật token mới vào localStorage
        const newStorage = JSON.parse(localStorage.getItem("kai-auth") || "{}");
        newStorage.state.accessToken = tokens.accessToken;
        newStorage.state.refreshToken = tokens.refreshToken;
        localStorage.setItem("kai-auth", JSON.stringify(newStorage));

        // Gắn token mới vào request cũ và thử lại
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // Refresh thất bại → xóa storage → redirect login
        localStorage.removeItem("kai-auth");
        window.location.href = "/auth";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
