import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '../router';

const TOKEN_KEY = 'rx_access_token';
const USER_KEY = 'rx_user_info';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
export const getUserInfo = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setUserInfo = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUserInfo = () => localStorage.removeItem(USER_KEY);

export const clearAuthAndGoLogin = () => {
  removeToken();
  removeUserInfo();
  if (router.currentRoute.value.name !== 'Login') {
    router.push({ name: 'Login' });
  }
};

const service = axios.create({
  baseURL: '/api',
  timeout: 30000
});

service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

      if (status === 401) {
        ElMessageBox.confirm(message || '登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          clearAuthAndGoLogin();
        }).catch(() => {
          clearAuthAndGoLogin();
        });
        return Promise.reject(error);
      }

      if (status === 403) {
        ElMessageBox.alert(
          message || '您没有权限执行此操作，请联系管理员。',
          '权限不足',
          {
            confirmButtonText: '知道了',
            type: 'error',
            dangerouslyUseHTMLString: true
          }
        );
        return Promise.reject(error);
      }

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
