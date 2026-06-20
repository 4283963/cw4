<template>
  <div class="review-panel">
    <div class="panel-left">
      <div class="patient-card">
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="22" color="#409eff"><UserFilled /></el-icon>
            <span class="card-title">患者信息</span>
          </div>
          <el-tag size="large" effect="dark" type="warning" v-if="reviewType === 'first'">处方一审</el-tag>
          <el-tag size="large" effect="dark" type="success" v-else>处方二审</el-tag>
        </div>
        <div class="patient-grid" v-if="current">
          <div class="grid-item">
            <span class="label">处方编号</span>
            <span class="value rx-no">{{ current.prescriptionNo }}</span>
          </div>
          <div class="grid-item">
            <span class="label">开方时间</span>
            <span class="value">{{ formatDate(current.createdAt) }}</span>
          </div>
          <div class="grid-item">
            <span class="label">姓名</span>
            <span class="value strong">{{ current.patientName }}</span>
          </div>
          <div class="grid-item">
            <span class="label">性别 / 年龄</span>
            <span class="value">
              {{ current.patientGender === 'male' ? '男' : current.patientGender === 'female' ? '女' : '-' }} / {{ current.patientAge }}岁
            </span>
          </div>
          <div class="grid-item">
            <span class="label">就诊科室</span>
            <span class="value">{{ current.department }}</span>
          </div>
          <div class="grid-item">
            <span class="label">开方医生</span>
            <span class="value">{{ current.doctorName }}</span>
          </div>
          <div class="grid-item full">
            <span class="label">诊断</span>
            <span class="value">{{ current.diagnosis || '-' }}</span>
          </div>
        </div>
        <el-empty v-else description="请从左侧选择处方开始审核" />
      </div>

      <div class="drug-card" v-if="current">
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="22" color="#67c23a"><Box /></el-icon>
            <span class="card-title">处方药品</span>
            <el-tag type="info" size="small">共 {{ current.items?.length || 0 }} 种</el-tag>
          </div>
        </div>
        <div class="drug-list">
          <div
            class="drug-item"
            v-for="(item, idx) in current.items"
            :key="item.id || idx"
          >
            <div class="drug-index">{{ idx + 1 }}</div>
            <div class="drug-info">
              <div class="drug-main">
                <strong class="drug-name">{{ item.drugName }}</strong>
                <el-tag size="small" type="info">{{ item.specification }}</el-tag>
              </div>
              <div class="drug-meta">
                <span><el-icon><Timer /></el-icon> {{ item.dosage }}</span>
                <span v-if="item.frequency">｜ 频次：{{ item.frequency }}</span>
                <span>｜ 数量：{{ item.quantity }}{{ item.unit }}</span>
                <span>｜ {{ item.daysSupply }}天</span>
              </div>
              <div class="drug-price">
                <el-tag size="small" type="warning">¥{{ item.price }} / {{ item.unit }}</el-tag>
                <el-tag size="small" type="danger">小计 ¥{{ item.subtotal }}</el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="total-bar">
          <span>合计金额：<strong class="total">¥ {{ totalAmount.toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="conflict-card" v-if="current && conflictCheck.hasConflicts">
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="22" :color="conflictCheck.hasDanger ? '#f56c6c' : '#e6a23c'"><Warning /></el-icon>
            <span class="card-title">配伍禁忌检查</span>
            <el-tag
              v-if="conflictCheck.hasDanger"
              type="danger"
              effect="dark"
            >{{ conflictCheck.dangerCount }} 项严重</el-tag>
            <el-tag
              v-if="conflictCheck.warningCount > 0"
              type="warning"
            >{{ conflictCheck.warningCount }} 项警告</el-tag>
          </div>
          <el-button type="primary" link @click="showConflictDetail = true">查看完整报告</el-button>
        </div>
        <el-alert
          v-for="(c, idx) in conflictCheck.conflicts"
          :key="idx"
          :title="`[${c.conflictType || '冲突'}] ${c.drugAName} + ${c.drugBName}`"
          :type="c.severity === 'danger' ? 'error' : 'warning'"
          :description="c.description"
          show-icon
          :closable="false"
          style="margin-bottom: 12px"
        />
      </div>

      <div
        v-else-if="current && !conflictCheck.hasConflicts"
        class="no-conflict"
      >
        <el-result
          icon="success"
          title="配伍检查通过"
          sub-title="未检测到药物配伍禁忌"
          style="padding: 12px 0"
        />
      </div>
    </div>

    <div class="panel-right">
      <div class="list-card">
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="22" color="#909399"><List /></el-icon>
            <span class="card-title">{{ reviewType === 'first' ? '待一审处方' : '待二审处方' }}</span>
            <el-badge :value="totalCount" class="item" />
          </div>
          <el-button size="small" :icon="Refresh" circle @click="fetchList" />
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索处方编号/患者姓名"
            size="default"
            clearable
            @input="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="prescription-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="prescription-item"
            :class="{ active: current?.id === item.id }"
            @click="selectPrescription(item)"
          >
            <div class="presc-head">
              <span class="presc-no">{{ item.prescriptionNo }}</span>
              <el-tag :type="getStatusType(item.status)" effect="light" size="small">
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
            <div class="presc-body">
              <span><el-icon><User /></el-icon> {{ item.patientName }}（{{ item.patientGender === 'male' ? '男' : item.patientGender === 'female' ? '女' : '-' }}{{ item.patientAge }}岁）</span>
            </div>
            <div class="presc-foot">
              <span class="dept">{{ item.department }}</span>
              <span class="time">{{ formatDate(item.createdAt, 'MM-DD HH:mm') }}</span>
            </div>
          </div>
          <el-empty v-if="!loading && list.length === 0" description="暂无待审核处方" :image-size="80" />
        </div>
        <div v-loading="loading"></div>
      </div>

      <div class="action-card" v-if="current">
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="22" color="#409eff"><EditPen /></el-icon>
            <span class="card-title">{{ reviewType === 'first' ? '一审操作' : '二审操作' }}</span>
          </div>
        </div>

        <div v-if="conflictCheck.hasDanger" class="danger-tip">
          <el-alert
            title="严重配伍禁忌提醒"
            type="error"
            description="该处方存在严重药物配伍禁忌，系统已禁止「通过审核」操作！请先联系医生修改处方或直接驳回。"
            show-icon
            :closable="false"
          />
        </div>

        <el-form ref="reviewFormRef" :model="reviewForm" label-width="80px">
          <el-form-item label="审核意见" prop="comment">
            <el-input
              v-model="reviewForm.comment"
              type="textarea"
              :rows="4"
              :placeholder="reviewType === 'first' ? '请填写一审意见（驳回必填）...' : '请填写二审意见（驳回必填）...'"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <div class="action-buttons">
            <el-button
              type="success"
              size="large"
              :icon="Check"
              :disabled="conflictCheck.hasDanger || submitting"
              :loading="submitting && submitType === 'pass'"
              @click="handleSubmit('pass')"
            >
              通过审核
            </el-button>
            <el-button
              type="danger"
              size="large"
              :icon="Close"
              :disabled="submitting"
              :loading="submitting && submitType === 'reject'"
              @click="handleSubmit('reject')"
            >
              驳回处方
            </el-button>
            <el-button size="large" :icon="RefreshLeft" @click="resetForm">
              重置意见
            </el-button>
          </div>
        </el-form>

        <div class="tip-text" v-if="!conflictCheck.hasDanger">
          <el-icon><InfoFilled /></el-icon>
          点击「通过审核」将自动执行配伍检查，存在风险时系统会弹窗提示。
        </div>
      </div>
      <div v-else class="no-select-tip">
        <el-empty description="请先选择待审处方" :image-size="100" />
      </div>
    </div>

    <DrugConflictAlert
      v-model="showConflictAlert"
      :conflict-check="conflictCheck"
      :block-operation="conflictCheck.hasDanger"
      @confirm="confirmPassWithWarning"
      @reject="quickReject"
    />

    <DrugConflictAlert
      v-model="showConflictDetail"
      :conflict-check="conflictCheck"
      :block-operation="false"
      :show-confirm="false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  UserFilled, Box, Timer, Warning, List, Refresh, Search, User,
  EditPen, Check, Close, RefreshLeft, InfoFilled
} from '@element-plus/icons-vue';
import {
  getPrescriptionList, getPrescriptionDetail, firstReview, secondReview
} from '@/api/prescription';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_MAP, REVIEW_RESULT } from '@/utils/constants';
import DrugConflictAlert from '@/components/DrugConflictAlert.vue';
import dayjs from 'dayjs';

const props = defineProps({
  reviewType: {
    type: String,
    required: true,
    validator: (v) => ['first', 'second'].includes(v)
  }
});

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const submitType = ref('');
const list = ref([]);
const current = ref(null);
const totalCount = ref(0);
const searchKeyword = ref('');
const showConflictAlert = ref(false);
const showConflictDetail = ref(false);
const reviewFormRef = ref(null);

const reviewForm = reactive({
  comment: '',
  reviewerId: 'pharmacist-001',
  reviewerName: '陈药师'
});

const conflictCheck = computed(() => current.value?.conflictCheck || {
  hasConflicts: false,
  conflicts: [],
  dangerCount: 0,
  warningCount: 0,
  hasDanger: false
});

const totalAmount = computed(() => {
  return (current.value?.items || []).reduce((sum, i) => sum + Number(i.subtotal || 0), 0);
});

const formatDate = (d, fmt = 'YYYY-MM-DD HH:mm') => d ? dayjs(d).format(fmt) : '-';
const getStatusType = (s) => PRESCRIPTION_STATUS_MAP[s]?.type || 'info';
const getStatusLabel = (s) => PRESCRIPTION_STATUS_MAP[s]?.label || s;

const filterStatus = computed(() => {
  return props.reviewType === 'first'
    ? PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW
    : PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW;
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getPrescriptionList({
      status: filterStatus.value,
      pageSize: 100,
      keyword: searchKeyword.value
    });
    list.value = res.data?.list || [];
    totalCount.value = res.data?.total || 0;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const selectPrescription = async (item) => {
  loading.value = true;
  try {
    const res = await getPrescriptionDetail(item.id);
    current.value = res.data;
    reviewForm.comment = '';
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchList();
};

const resetForm = () => {
  reviewForm.comment = '';
};

const handleSubmit = async (type) => {
  if (!current.value) return;

  if (type === 'reject' && !reviewForm.comment.trim()) {
    ElMessage.warning('驳回处方必须填写审核意见');
    return;
  }

  if (type === 'pass') {
    if (conflictCheck.value.hasDanger) {
      showConflictAlert.value = true;
      return;
    }
    if (conflictCheck.value.hasConflicts) {
      showConflictAlert.value = true;
      return;
    }
  }

  await confirmSubmit(type);
};

const confirmPassWithWarning = () => {
  confirmSubmit('pass');
};

const quickReject = () => {
  if (!reviewForm.comment.trim()) {
    reviewForm.comment = '存在严重药物配伍禁忌，直接驳回，请医生修改处方后重新提交。';
  }
  confirmSubmit('reject');
};

const confirmSubmit = async (type) => {
  const actionText = type === 'pass' ? '通过' : '驳回';
  try {
    await ElMessageBox.confirm(
      `确认${actionText}处方「${current.value.prescriptionNo}」吗？此操作不可撤销。`,
      '审核确认',
      {
        confirmButtonText: `确认${actionText}`,
        cancelButtonText: '取消',
        type: type === 'pass' ? 'success' : 'warning'
      }
    );
  } catch {
    return;
  }

  submitting.value = true;
  submitType.value = type;
  try {
    const payload = {
      ...reviewForm,
      result: type === 'pass' ? REVIEW_RESULT.PASSED : REVIEW_RESULT.REJECTED
    };

    const res = props.reviewType === 'first'
      ? await firstReview(current.value.id, payload)
      : await secondReview(current.value.id, payload);

    if (res.success) {
      ElMessage.success(`处方${actionText}成功，已流转至下一状态`);
      current.value = null;
      reviewForm.comment = '';
      fetchList();
    } else {
      if (res.data && res.data.hasConflicts) {
        showConflictAlert.value = true;
      } else {
        ElMessage.error(res.message || '操作失败');
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    submitting.value = false;
    submitType.value = '';
  }
};

onMounted(async () => {
  await fetchList();
  if (route.query.id) {
    await nextTick();
    const target = list.value.find((i) => i.id === route.query.id);
    if (target) {
      selectPrescription(target);
      router.replace({ query: {} });
    } else {
      ElMessage.info('该处方不在当前待审列表，或状态已变更');
    }
  }
});

watch(() => props.reviewType, () => {
  current.value = null;
  fetchList();
});
</script>

<style scoped>
.review-panel {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 16px;
  height: calc(100vh - 60px - 40px);
}

.panel-left,
.panel-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.panel-left {
  overflow-y: auto;
  padding-right: 4px;
}

.patient-card,
.drug-card,
.conflict-card,
.list-card,
.action-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.header-left .el-tag {
  margin-left: 4px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.patient-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  padding: 20px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grid-item.full {
  grid-column: 1 / -1;
}

.grid-item .label {
  font-size: 12px;
  color: #909399;
}

.grid-item .value {
  font-size: 14px;
  color: #303133;
}

.grid-item .value.strong {
  font-weight: 600;
}

.grid-item .value.rx-no {
  font-family: monospace;
  font-weight: 600;
  color: #409eff;
  letter-spacing: 0.5px;
}

.drug-list {
  padding: 16px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drug-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: #f7f9fc;
  border-radius: 8px;
  border-left: 3px solid #67c23a;
}

.drug-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #67c23a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.drug-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.drug-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.drug-name {
  font-size: 15px;
  color: #303133;
}

.drug-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  align-items: center;
}

.drug-meta .el-icon {
  font-size: 12px;
}

.drug-price {
  display: flex;
  gap: 8px;
}

.total-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 14px 20px;
  background: #fff7e6;
  color: #606266;
  font-size: 14px;
  margin-top: 12px;
}

.total-bar .total {
  font-size: 20px;
  color: #f56c6c;
  margin-left: 6px;
}

.conflict-card .card-header {
  background: linear-gradient(90deg, #fdf6ec 0%, #fff 100%);
}

.no-conflict {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.danger-tip {
  margin-bottom: 16px;
}

.panel-right {
  min-height: 0;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-box {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.prescription-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: relative;
}

.prescription-item {
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #f7f9fc;
}

.prescription-item:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.prescription-item.active {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-color: #409eff;
  color: #fff;
}

.prescription-item.active .presc-no,
.prescription-item.active .presc-body,
.prescription-item.active .presc-foot {
  color: #fff;
}

.prescription-item.active .el-tag {
  opacity: 0.9;
}

.presc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.presc-no {
  font-family: monospace;
  font-weight: 600;
  font-size: 13px;
}

.presc-body {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.presc-body .el-icon {
  font-size: 12px;
}

.presc-foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.action-card {
  flex-shrink: 0;
}

.action-card .card-header {
  padding: 14px 20px;
}

.action-card :deep(.el-form) {
  padding: 16px 20px 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.tip-text {
  padding: 10px 20px 16px;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.no-select-tip {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.item :deep(.el-badge__content) {
  border: none;
}
</style>
