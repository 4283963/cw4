<template>
  <div class="review-page">
    <el-page-header content="处方二审" @back="$router.back()">
      <template #content>
        <div class="page-title">
          <el-icon :size="24" color="#67c23a"><Check /></el-icon>
          <span>处方二审（主管药师复核）</span>
          <el-tag type="success" effect="light" style="margin-left: 12px">
            对一审通过的处方进行最终复核，确保用药安全
          </el-tag>
        </div>
      </template>
    </el-page-header>
    <div style="margin-top: 12px">
      <ReviewPanel review-type="second" />
    </div>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue';
import ReviewPanel from '@/components/ReviewPanel.vue';
</script>

<style scoped>
.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
