import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api',
  timeout: 30000
});

service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.success === false) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      if (status === 400) {
        if (error.response.data?.data) {
          return Promise.resolve({
            success: false,
            message: message,
            data: error.response.data.data
          });
        }
        ElMessage.warning(message);
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在');
      } else if (status === 500) {
        ElMessage.error('服务器内部错误');
      } else {
        ElMessage.error(message || `请求错误 (${status})`);
      }
    } else {
      ElMessage.error('网络错误，请检查连接');
    }
    return Promise.reject(error);
  }
);

export default service;
