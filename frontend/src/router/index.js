import { createRouter, createWebHistory } from 'vue-router';

const routes = [
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
    meta: { title: '处方一审' }
  },
  {
    path: '/review/second',
    name: 'SecondReview',
    component: () => import('@/views/review/SecondReview.vue'),
    meta: { title: '处方二审' }
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
    meta: { title: '配伍禁忌维护' }
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
  next();
});

export default router;
