// src/utils/request.ts
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取API基础URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器 - 在发送请求前做些什么
service.interceptors.request.use(
  (config) => {
    // 获取用户存储中的token
    const userStore = useUserStore();
    const token = userStore.token;

    // 如果token存在，将其添加到请求头中
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器 - 在接收到响应后做些什么
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  (error) => {
    // 对响应错误做点什么
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token过期或未授权
          const userStore = useUserStore();
          userStore.logout();
          ElMessage.error('登录已过期，请重新登录');
          router.push('/login');
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error(error.response.data?.message || '请求错误');
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接');
    }

    return Promise.reject(error);
  }
);

export default service;