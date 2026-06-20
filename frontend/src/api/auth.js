import request, { setToken, setUserInfo, removeToken, removeUserInfo, clearAuthAndGoLogin } from '@/utils/request';

export const login = async (username, password) => {
  const res = await request.post('/auth/login', { username, password });
  if (res.success !== false) {
    setToken(res.token);
    setUserInfo(res.user);
  }
  return res;
};

export const getProfile = async () => {
  return request.get('/auth/profile');
};

export const logout = () => {
  removeToken();
  removeUserInfo();
  clearAuthAndGoLogin();
};
