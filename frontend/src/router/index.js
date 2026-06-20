import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getToken } from '@/utils/request';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/prescriptions',
    name: 'PrescriptionList',
    component: () => import('@/views/prescriptions/PrescriptionList.vue'),
    meta: { title: '处方管理' }
  },
  {
    path: '/prescriptions/:id',
    name: 'PrescriptionDetail',
    component: () => import('@/views/prescriptions/PrescriptionDetail.vue'),
    meta: { title: '处方详情' }
  },
  {
    path: '/review/first',
    name: 'FirstReview',
    component: () => import('@/views/review/FirstReview.vue'),
    meta: { title: '处方一审', roles: ['pharmacist', 'senior_pharmacist', 'admin'] }
  },
  {
    path: '/review/second',
    name: 'SecondReview',
    component: () => import('@/views/review/SecondReview.vue'),
    meta: { title: '处方二审', roles: ['senior_pharmacist', 'admin'] }
  },
  {
    path: '/drugs',
    name: 'DrugList',
    component: () => import('@/views/DrugList.vue'),
    meta: { title: '药品管理' }
  },
  {
    path: '/conflicts',
    name: 'DrugConflictList',
    component: () => import('@/views/DrugConflictList.vue'),
    meta: { title: '配伍禁忌维护', roles: ['senior_pharmacist', 'admin'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 电子处方管理系统`
    : '电子处方管理系统';

  if (to.meta.requiresAuth === false) {
    return next();
  }

  const token = getToken();
  if (!token) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.roles && to.meta.roles.length) {
    const raw = localStorage.getItem('rx_user_info');
    let user = null;
    try { user = raw ? JSON.parse(raw) : null; } catch (e) { user = null; }
    if (!user || !to.meta.roles.includes(user.role)) {
      ElMessage.warning(`当前账号（${user?.roleLabel || '无角色'}）无权访问该页面`);
      return next({ name: 'Dashboard' });
    }
  }

  next();
});

export default router;
