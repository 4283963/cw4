<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    :close-on-click-modal="false"
    :close-on-press-escape="!blockOperation"
    class="conflict-alert-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <el-icon :size="24" :color="hasDanger ? '#f56c6c' : '#e6a23c'" class="header-icon">
          <component :is="hasDanger ? CircleClose : Warning" />
        </el-icon>
        <span class="header-title">{{ dialogTitle }}</span>
        <el-tag v-if="hasDanger" type="danger" effect="dark" size="large">严重</el-tag>
        <el-tag v-else type="warning" effect="dark" size="large">警告</el-tag>
      </div>
    </template>

    <div class="conflict-summary">
      <el-alert
        :title="summaryText"
        :type="hasDanger ? 'error' : 'warning'"
        :description="descriptionText"
        show-icon
        :closable="false"
      />
    </div>

    <div class="conflict-list">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="(conflict, index) in conflicts"
          :key="conflict.id || index"
          :name="conflict.id || String(index)"
        >
          <template #title>
            <div class="conflict-title">
              <el-tag
                :type="conflict.severity === 'danger' ? 'danger' : 'warning'"
                effect="dark"
                size="small"
                style="margin-right: 12px"
              >
                {{ conflict.severity === 'danger' ? '严重' : '警告' }}
              </el-tag>
              <span class="conflict-type">[{{ conflict.conflictType || '配伍冲突' }}]</span>
              <span class="conflict-drugs">
                <el-tag type="info" size="small">{{ conflict.drugAName }}</el-tag>
                <el-icon style="margin: 0 6px"><Connection /></el-icon>
                <el-tag type="info" size="small">{{ conflict.drugBName }}</el-tag>
              </span>
            </div>
          </template>

          <div class="conflict-detail">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="冲突描述">
                <div class="desc-text">{{ conflict.description }}</div>
              </el-descriptions-item>
              <el-descriptions-item v-if="conflict.evidence" label="证据来源">
                <div class="desc-text evidence">{{ conflict.evidence }}</div>
              </el-descriptions-item>
              <el-descriptions-item v-if="conflict.suggestion" label="处理建议">
                <div class="desc-text suggestion">{{ conflict.suggestion }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="blockOperation"
          type="danger"
          size="large"
          @click="handleReject"
        >
          <el-icon><Close /></el-icon>
          驳回处方
        </el-button>
        <el-button
          v-if="!blockOperation && showConfirm"
          type="warning"
          size="large"
          @click="handleConfirm"
        >
          <el-icon><Check /></el-icon>
          已知晓，继续操作
        </el-button>
        <el-button size="large" @click="handleClose">
          {{ blockOperation ? '关闭' : '取消' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import {
  Warning, CircleClose, Connection, Check, Close
} from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  conflictCheck: {
    type: Object,
    default: () => ({
      hasConflicts: false,
      conflicts: [],
      dangerCount: 0,
      warningCount: 0,
      hasDanger: false
    })
  },
  blockOperation: {
    type: Boolean,
    default: false
  },
  showConfirm: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'reject', 'close']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeNames = ref([]);

const conflicts = computed(() => props.conflictCheck?.conflicts || []);
const hasDanger = computed(() => props.conflictCheck?.hasDanger || false);
const dangerCount = computed(() => props.conflictCheck?.dangerCount || 0);
const warningCount = computed(() => props.conflictCheck?.warningCount || 0);

watch(() => props.modelValue, (val) => {
  if (val) {
    activeNames.value = conflicts.value.map((c, i) => c.id || String(i));
  }
}, { immediate: true });

const dialogTitle = computed(() => {
  if (hasDanger.value) {
    return '严重药物配伍冲突，禁止通过审核';
  }
  return '药物配伍冲突提示';
});

const summaryText = computed(() => {
  const parts = [];
  if (dangerCount.value > 0) {
    parts.push(`检测到 ${dangerCount.value} 项严重冲突`);
  }
  if (warningCount.value > 0) {
    parts.push(`${warningCount.value} 项警告`);
  }
  return parts.join('，') || '存在用药风险';
});

const descriptionText = computed(() => {
  if (hasDanger.value) {
    return '该处方存在严重的药物配伍禁忌，可能危及患者安全。系统已阻止审核通过操作，请先联系医生修改处方，或驳回后处理。';
  }
  return '该处方存在潜在的药物相互作用风险，请仔细评估，确认临床用药的合理性。';
});

const handleClose = () => {
  visible.value = false;
  emit('close');
};

const handleConfirm = () => {
  emit('confirm', props.conflictCheck);
  visible.value = false;
};

const handleReject = () => {
  emit('reject', props.conflictCheck);
  visible.value = false;
};
</script>

<style scoped>
.conflict-alert-dialog :deep(.el-dialog__header) {
  padding: 16px 24px;
  margin-right: 0;
  border-bottom: 1px solid #ebeef5;
}

.conflict-alert-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.conflict-summary {
  margin-bottom: 20px;
}

.conflict-list {
  max-height: 420px;
  overflow-y: auto;
}

.conflict-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
}

.conflict-type {
  color: #606266;
  margin-right: 12px;
  font-weight: 500;
}

.conflict-drugs {
  display: flex;
  align-items: center;
  color: #303133;
}

.conflict-detail {
  padding: 12px 8px;
}

.desc-text {
  line-height: 1.7;
  color: #303133;
}

.desc-text.evidence {
  color: #606266;
  font-size: 13px;
}

.desc-text.suggestion {
  color: #409eff;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.conflict-alert-dialog :deep(.el-alert__description) {
  margin-top: 8px;
  line-height: 1.6;
}
</style>
