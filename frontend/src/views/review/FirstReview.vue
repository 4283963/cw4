<template>
  <div class="review-page">
    <el-page-header content="处方一审" @back="$router.back()">
      <template #content>
        <div class="page-title">
          <el-icon :size="24" color="#e6a23c"><EditPen /></el-icon>
          <span>处方一审（药师审核）</span>
          <el-tag type="warning" effect="light" style="margin-left: 12px">
            对医生开具的处方进行首次审核，检查用药合理性
          </el-tag>
        </div>
      </template>
    </el-page-header>
    <div style="margin-top: 12px">
      <ReviewPanel review-type="first" />
    </div>
  </div>
</template>

<script setup>
import { EditPen } from '@element-plus/icons-vue';
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
