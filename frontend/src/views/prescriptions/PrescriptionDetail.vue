<template>
  <div class="prescription-detail" v-loading="loading">
    <el-page-header @back="goBack" :content="`处方详情 - ${detail?.prescriptionNo || ''}`">
      <template #extra>
        <el-button
          v-if="detail?.status === PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW"
          type="warning"
          :icon="EditPen"
          size="large"
          @click="goReview('first')"
        >前往一审</el-button>
        <el-button
          v-if="detail?.status === PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW"
          type="success"
          :icon="Check"
          size="large"
          @click="goReview('second')"
        >前往二审</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 16px">
      <el-col :span="16">
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>患者信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="处方编号">
              <span class="rx-no">{{ detail?.prescriptionNo }}</span>
              <el-tag
                :type="getStatusType(detail?.status)"
                effect="light"
                size="large"
                style="margin-left: 12px"
              >{{ getStatusLabel(detail?.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开方时间">{{ formatDate(detail?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="患者姓名">{{ detail?.patientName }}</el-descriptions-item>
            <el-descriptions-item label="性别 / 年龄">
              {{ detail?.patientGender === 'male' ? '男' : detail?.patientGender === 'female' ? '女' : '-' }}
              / {{ detail?.patientAge || '-' }} 岁
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ detail?.patientIdCard || '-' }}</el-descriptions-item>
            <el-descriptions-item label="就诊科室">{{ detail?.department || '-' }}</el-descriptions-item>
            <el-descriptions-item label="诊断" :span="2">
              <div style="line-height: 1.6">{{ detail?.diagnosis || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="开方医生">{{ detail?.doctorName }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detail?.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="detail-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon><Box /></el-icon>
              <span>处方明细</span>
              <el-tag type="info" size="small" style="margin-left: 8px">共 {{ detail?.items?.length || 0 }} 种</el-tag>
            </div>
          </template>
          <el-table :data="detail?.items || []" border stripe>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="drugName" label="药品名称" min-width="180">
              <template #default="{ row }">
                <div class="drug-name-cell">
                  <strong>{{ row.drugName }}</strong>
                  <div class="drug-spec">{{ row.specification }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="dosage" label="用法用量" min-width="220" show-overflow-tooltip />
            <el-table-column prop="frequency" label="频次" width="100" />
            <el-table-column label="数量" width="100" align="center">
              <template #default="{ row }">{{ row.quantity }} {{ row.unit }}</template>
            </el-table-column>
            <el-table-column prop="daysSupply" label="天数" width="80" align="center">
              <template #default="{ row }">{{ row.daysSupply }}天</template>
            </el-table-column>
            <el-table-column prop="price" label="单价(元)" width="100" align="right" />
            <el-table-column prop="subtotal" label="小计(元)" width="100" align="right" />
          </el-table>
          <div class="total-row">
            <span>合计金额：</span>
            <span class="total-amount">¥ {{ totalAmount.toFixed(2) }}</span>
          </div>
        </el-card>

        <el-card
          v-if="detail?.conflictCheck?.hasConflicts"
          shadow="never"
          class="detail-card conflict-card"
          style="margin-top: 16px"
        >
          <template #header>
            <div class="card-header conflict-header">
              <el-icon :color="detail.conflictCheck.hasDanger ? '#f56c6c' : '#e6a23c'"><Warning /></el-icon>
              <span>配伍禁忌检查结果</span>
              <el-tag
                v-if="detail.conflictCheck.hasDanger"
                type="danger"
                effect="dark"
              >{{ detail.conflictCheck.dangerCount }} 项严重</el-tag>
              <el-tag
                v-if="detail.conflictCheck.warningCount > 0"
                type="warning"
              >{{ detail.conflictCheck.warningCount }} 项警告</el-tag>
              <el-button type="primary" link size="small" @click="showConflictAlert = true">查看详情</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(c, idx) in detail.conflictCheck.conflicts"
              :key="idx"
              :type="c.severity === 'danger' ? 'danger' : 'warning'"
              :icon="Warning"
            >
              <el-alert
                :title="`${c.drugAName} + ${c.drugBName}  [${c.conflictType || '配伍冲突'}]`"
                :type="c.severity === 'danger' ? 'error' : 'warning'"
                :description="c.description"
                show-icon
                :closable="false"
              />
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <el-icon><EditPen /></el-icon>
              <span>审核流程</span>
            </div>
          </template>
          <el-steps :active="stepActive" finish-status="success" direction="vertical">
            <el-step title="医生开具" :description="formatDate(detail?.createdAt)" />
            <el-step
              title="提交审核"
              :description="detail?.status !== PRESCRIPTION_STATUS.DRAFT ? '已提交' : '未提交'"
            />
            <el-step
              title="一审（药师）"
              :description="formatReviewInfo('first')"
            />
            <el-step
              title="二审（主管药师）"
              :description="formatReviewInfo('second')"
            />
          </el-steps>
        </el-card>

        <el-card
          v-if="detail?.firstReviewComment || detail?.secondReviewComment"
          shadow="never"
          class="detail-card"
          style="margin-top: 16px"
        >
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>审核意见</span>
            </div>
          </template>
          <div v-if="detail.firstReviewComment" class="comment-block">
            <div class="comment-header">
              <el-tag type="primary" size="small">一审意见 - {{ detail.firstReviewerName }}</el-tag>
              <span class="comment-time">{{ formatDate(detail.firstReviewTime) }}</span>
            </div>
            <div class="comment-content">{{ detail.firstReviewComment }}</div>
          </div>
          <div v-if="detail.secondReviewComment" class="comment-block">
            <div class="comment-header">
              <el-tag type="success" size="small">二审意见 - {{ detail.secondReviewerName }}</el-tag>
              <span class="comment-time">{{ formatDate(detail.secondReviewTime) }}</span>
            </div>
            <div class="comment-content">{{ detail.secondReviewComment }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <DrugConflictAlert
      v-model="showConflictAlert"
      :conflict-check="detail?.conflictCheck"
      :block-operation="detail?.conflictCheck?.hasDanger"
      :show-confirm="false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  User, Box, EditPen, Check, Warning, ChatDotRound
} from '@element-plus/icons-vue';
import { getPrescriptionDetail } from '@/api/prescription';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_MAP } from '@/utils/constants';
import DrugConflictAlert from '@/components/DrugConflictAlert.vue';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const detail = ref(null);
const showConflictAlert = ref(false);

const stepActive = computed(() => {
  const s = detail.value?.status;
  if (!s) return 0;
  if (s === PRESCRIPTION_STATUS.DRAFT) return 1;
  if (s === PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW) return 2;
  if ([PRESCRIPTION_STATUS.FIRST_REVIEW_PASSED, PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED, PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW].includes(s)) return 3;
  if ([PRESCRIPTION_STATUS.SECOND_REVIEW_PASSED, PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED, PRESCRIPTION_STATUS.DISPENSED].includes(s)) return 4;
  return 0;
});

const totalAmount = computed(() => {
  return (detail.value?.items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
});

const getStatusType = (s) => PRESCRIPTION_STATUS_MAP[s]?.type || 'info';
const getStatusLabel = (s) => PRESCRIPTION_STATUS_MAP[s]?.label || s;
const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';

const formatReviewInfo = (type) => {
  if (type === 'first') {
    if (detail.value?.firstReviewerName) {
      const result = detail.value.status === PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED ? '（驳回）' : '（通过）';
      return `${detail.value.firstReviewerName} ${result} ${formatDate(detail.value.firstReviewTime)}`;
    }
    if (detail.value?.status === PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW) return '待审核';
    return '未开始';
  } else {
    if (detail.value?.secondReviewerName) {
      const result = detail.value.status === PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED ? '（驳回）' : '（通过）';
      return `${detail.value.secondReviewerName} ${result} ${formatDate(detail.value.secondReviewTime)}`;
    }
    if (detail.value?.status === PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW) return '待审核';
    return '未开始';
  }
};

const fetchDetail = async () => {
  loading.value = true;
  try {
    const res = await getPrescriptionDetail(route.params.id);
    detail.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const goReview = (type) => {
  router.push(type === 'first'
    ? { path: '/review/first', query: { id: detail.value.id } }
    : { path: '/review/second', query: { id: detail.value.id } }
  );
};

onMounted(fetchDetail);
</script>

<style scoped>
.detail-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.card-header .el-tag,
.card-header .el-button {
  margin-left: auto;
}

.rx-no {
  font-family: monospace;
  font-weight: 600;
  color: #409eff;
}

.drug-name-cell {
  line-height: 1.4;
}

.drug-spec {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #ebeef5;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
  margin-left: 8px;
}

.conflict-card :deep(.el-card__header) {
  background: linear-gradient(90deg, #fdf6ec 0%, #fff 100%);
}

.conflict-header {
  flex-wrap: wrap;
  gap: 10px;
}

.comment-block {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.comment-block:last-child {
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  line-height: 1.6;
  color: #303133;
  padding: 0 4px;
}
</style>
