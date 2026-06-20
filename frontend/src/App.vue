<template>
  <router-view v-if="isLoginPage" />
  <el-container v-else class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#fff"><Prescription /></el-icon>
          <span class="title">互联网医院电子处方管理系统</span>
        </div>
        <div class="user-info">
          <el-tag type="success" effect="dark">
            {{ currentUser.realName || '未登录' }}（{{ currentUser.roleLabel || '—' }}）
          </el-tag>
          <el-dropdown trigger="click" style="margin-left: 16px" @command="handleDropdownCommand">
            <el-button :icon="User" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>所属：{{ currentUser.department || '—' }}</el-dropdown-item>
                <el-dropdown-item disabled>职称：{{ currentUser.title || '—' }}</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#fff"
          class="side-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/prescriptions">
            <el-icon><Document /></el-icon>
            <span>处方管理</span>
          </el-menu-item>
          <el-menu-item
            v-if="canFirstReview"
            index="/review/first"
          >
            <el-icon><EditPen /></el-icon>
            <span>处方一审</span>
          </el-menu-item>
          <el-menu-item
            v-if="canSecondReview"
            index="/review/second"
          >
            <el-icon><Check /></el-icon>
            <span>处方二审</span>
          </el-menu-item>
          <el-menu-item index="/drugs">
            <el-icon><Box /></el-icon>
            <span>药品管理</span>
          </el-menu-item>
          <el-menu-item
            v-if="canSecondReview"
            index="/conflicts"
          >
            <el-icon><Warning /></el-icon>
            <span>配伍禁忌维护</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { User, Prescription, DataAnalysis, Document, EditPen, Check, Box, Warning } from '@element-plus/icons-vue';
import { getUserInfo } from '@/utils/request';
import { logout } from '@/api/auth';

const route = useRoute();

const currentUser = ref(getUserInfo() || {});

const isLoginPage = computed(() => route.name === 'Login');

const canFirstReview = computed(() =>
  ['pharmacist', 'senior_pharmacist', 'admin'].includes(currentUser.value.role)
);
const canSecondReview = computed(() =>
  ['senior_pharmacist', 'admin'].includes(currentUser.value.role)
);

const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith('/review/first')) return '/review/first';
  if (path.startsWith('/review/second')) return '/review/second';
  if (path.startsWith('/prescriptions')) return '/prescriptions';
  return path;
});

watch(
  () => route.fullPath,
  () => {
    currentUser.value = getUserInfo() || {};
  },
  { immediate: true }
);

const handleDropdownCommand = (cmd) => {
  if (cmd === 'logout') {
    logout();
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100%;
}

.app-header {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.app-aside {
  background: #001529;
  overflow-y: auto;
}

.side-menu {
  border-right: none;
  min-height: calc(100vh - 60px);
}

.side-menu .el-menu-item {
  height: 52px;
  line-height: 52px;
}

.side-menu .el-menu-item:hover {
  background: #1890ff !important;
}

.side-menu .el-menu-item.is-active {
  background: #1890ff !important;
}

.app-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
