<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="44" color="#409eff"><Prescription /></el-icon>
        <h1 class="title">互联网医院电子处方管理系统</h1>
        <p class="subtitle">Prescription Review Platform</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-width="0"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tips">
        <el-alert
          title="测试账号（密码均为 123456）"
          type="info"
          :closable="false"
          show-icon
        >
          <div class="account-list">
            <div>• 管理员：admin / 123456</div>
            <div>• 医生：doctor_wang / 123456</div>
            <div>• 药师（一审）：pharmacist_chen / 123456</div>
            <div>• 主管药师（二审）：senior_li / 123456</div>
          </div>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Prescription } from '@element-plus/icons-vue';
import { login } from '@/api/auth';
import { getToken } from '@/utils/request';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ]
};

onMounted(() => {
  if (getToken()) {
    router.replace({ name: 'Dashboard' });
  }
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await login(loginForm.username, loginForm.password);
    if (res.success !== false) {
      ElMessage.success(`欢迎回来，${res.user.realName}（${res.user.roleLabel}）`);
      router.replace({ name: 'Dashboard' });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  margin-top: 14px;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.login-form {
  margin-top: 16px;
}

.submit-btn {
  width: 100%;
  letter-spacing: 4px;
  height: 44px;
}

.login-tips {
  margin-top: 20px;
}

.account-list {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.9;
  color: #4b5563;
}
</style>
