<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { ref, onMounted, watch } from 'vue';

import {
  startWorkTask,
  finishWorkTask,
  saveWorkFeedback,
  getMachineryList,
  getConfigByConfigKey,
  getMouldList,
  getOperatorList,
} from '~/api';
import ReCol24 from './ReCol24.vue';
import ReColForm from './ReColForm.vue';
import UnlockFormDialog from './UnlockFormDialog.vue';
import { useAppStoreHook } from '~/store/modules/app';
import PickingFormDialog from './PickingFormDialog.vue';
import ProductReceiptFormDialog from './ProductReceiptFormDialog.vue';

const props = defineProps({
  defaultQuantityNum: {
    type: Number,
    required: true,
    default: 0,
  },
  workTask: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['done']);

const { previousTask, erweimaData } = storeToRefs(useAppStoreHook());
const formRules = ref({
  // machineryId: [{ required: true, trigger: 'blur', message: '请选择设备' }],
  mouldId: [
    {
      trigger: 'blur',
      message: '请选择模具',
      validator: (
        _rule: any,
        value: string,
        callback: (arg0?: Error | undefined) => void
      ) => {
        if (
          formData.value.processName.indexOf('成型') !== -1 &&
          formData.value.processName.indexOf('成型工检') === -1 &&
          value === ''
        ) {
          callback(new Error('请选择模具'));
        } else {
          callback();
        }
      },
    },
  ],
  userId: [{ required: true, trigger: 'blur', message: '请选择操作人' }],
  quantityQualified: [
    { required: true, trigger: 'blur', message: '请输入产出数量' },
    {
      trigger: 'blur',
      validator: (
        _rule: any,
        value: any,
        callback: (arg0?: Error | undefined) => void
      ) => {
        if (value === '') {
          callback(new Error('请输入产出数量'));
        } else if (value === 0) {
          callback(new Error('产出数量不能为0!'));
        } else if (
          formData.value.unlockUserId ===
            '00000000-0000-0000-0000-000000000000' &&
          (Math.abs(value - formData.value.quantity) /
            formData.value.quantity) *
            100 >
            quantityQualifiedDeviation.value
        ) {
          callback(
            new Error(
              '产出数量超过或低于百分之' +
                quantityQualifiedDeviation.value +
                ',需要解锁。'
            )
          );
        } else {
          callback();
        }
      },
    },
  ],
});
const formRef = ref();
const formData = ref();
const quantityNum = ref(0);
const loading = ref(false);
const unlockDialogRef = ref();
const receiptDialogRef = ref();
const pickingDialogRef = ref();
const isBeforehand = ref(false);
const mouldList = ref<Array<any>>([]);
const operatorList = ref<Array<any>>([]);
const machineryList = ref<Array<any>>([]);
const quantityQualifiedDeviation = ref(0);

watch(
  () => props.defaultQuantityNum,
  val => {
    quantityNum.value = val;
  },
  { immediate: true }
);
watch(
  () => props.workTask,
  val => {
    formData.value = val;
  },
  { immediate: true }
);

/**
 * 获取设备列表
 */
function getMachineryListData() {
  getMachineryList({
    processId: formData.value.processId,
  })
    .then(res => {
      machineryList.value = res.data;
    })
    .catch(err => {
      console.log(err);
    });
}
/**
 * 获取操作人列表
 */
function getOperatorListData() {
  getOperatorList({
    jobStatus: 1, // 在职状态 0-全部 1-在职 2-离职 3-停职
    sysOwnerCpy: erweimaData.value.sysOwnerCpy,
    deptId: formData.value.workshopId,
  })
    .then(res => {
      operatorList.value = res.data;
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => {
      if (operatorList.value.length < 1) {
        getOperatorList({
          jobStatus: 1, // 在职状态 0-全部 1-在职 2-离职 3-停职
          deptId: undefined,
        })
          .then(res => {
            operatorList.value = res.data;
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
}
/**
 * 获取模具列表
 */
function getMouldListData() {
  // 获取模具
  getMouldList({
    isSearch: 0,
    isEnable: 1,
    productLineType: erweimaData.value.productLineType,
    workshopId: formData.value.workshopId,
    status: 2,
    // mouldWorkshop: formData.value.workshopId,
    // sysOwnerCpy: erweimaData.value.sysOwnerCpy
  })
    .then(res => {
      mouldList.value = res.data;
    })
    .catch(err => {
      console.log(err);
    });
}
/**
 * 获取产出数量偏差百分比
 */
function getQuantityQualifiedDeviationData() {
  getConfigByConfigKey({
    configKey: 'OffsetPercent',
    // mouldWorkshop: formData.value.workshopId,
    // sysOwnerCpy: erweimaData.value.sysOwnerCpy
  })
    .then(res => {
      quantityQualifiedDeviation.value = parseFloat(res.data.configValue);
    })
    .catch(err => {
      console.log(err);
    });
}
/**
 * 刷新数据
 */
function refreshData() {
  emits('done');
}
/**
 * 开始任务事件
 */
function handleStart() {
  loading.value = true;
  startWorkTask({
    workOrderId: erweimaData.value.workOrderId,
    taskId: formData.value.taskId,
  })
    .then(({ code, message }) => {
      // if (erweimaData.value.isAntecede === true) {
      //   xianxingClick(erweimaData.value)
      // } else {
      if (code === 0) {
        ElMessage.success(message);
        emits('done');
      }

      // }
    })
    .catch(err => {
      console.log(err);
    })
    .finally(() => {
      loading.value = false;
    });
}
/**
 * 结束任务事件
 */
function handleEnd() {
  if (formData.value.checkStatus === 1) {
    formRef.value.validate((valid: any) => {
      if (valid) {
        loading.value = true;

        modify(true)
          .then(() => {
            finishWorkTask({
              workOrderId: erweimaData.value.workOrderId,
              taskId: formData.value.taskId,
              quantityProduced: formData.value.quantityQualified,
            })
              .then(({ code, message }) => {
                // if (erweimaData.value.isAntecede === true) {
                //   xianxingClick(erweimaData.value)
                // } else {
                if (code === 0) {
                  ElMessage.success(message);
                  emits('done');
                }
                // }
              })
              .catch(err => {
                console.log(err);
              })
              .finally(() => {
                loading.value = false;
              });
          })
          .catch(() => {
            loading.value = false;
          });
      }
    });
  } else {
    loading.value = true;

    finishWorkTask({
      workOrderId: erweimaData.value.workOrderId,
      taskId: formData.value.taskId,
      quantityProduced: formData.value.quantityProduced,
    })
      .then(({ code, message }) => {
        // if (erweimaData.value.isAntecede === true) {
        //   xianxingClick(erweimaData.value)
        // } else {
        if (code === 0) {
          ElMessage.success(message);
          emits('done');
        }
        // }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        loading.value = false;
      });
  }
}
/**
 * 领料事件
 */
function handlePick() {
  if (!quantityNum.value) {
    ElMessage.info('请输入生产数量');
    return;
  }
  pickingDialogRef.value.show(
    formData.value,
    quantityNum.value,
    isBeforehand.value
  );
}
/**
 * 入库事件
 * @param {*} formData
 */
function handleReceipt() {
  if (!formData.value.quantityQualified) {
    ElMessage.warning('请输入产出数量');
    return;
  }
  receiptDialogRef.value.show(formData.value, erweimaData.value);
}
/**
 *设备改变回调
 * @param {*} val
 */
function handleMachineryChange(val: any) {
  const machinery = machineryList.value.find(item => item.value === val);
  if (machinery) {
    formData.value.machineryName = machinery.name;
    formData.value.machineryCode = machinery.code;
  } else {
    formData.value.machineryName = '';
    formData.value.machineryId = '';
    formData.value.machineryCode = '';
  }
  formRef.value.validateField('machineryId', () => null);
}
/**
 * 模具改变回调
 * @param {*} val
 */
function handleMouldChange(val: any) {
  const mould = mouldList.value.find(item => item.value === val);
  formData.value.mouldName = mould.name;
  formData.value.mouldCode = mould.code;
  formRef.value.validateField('mouldId', () => null);
}
/**
 * 操作人改变回调
 * @param {*} val
 */
function handleUserChange(val: any) {
  const user: any = operatorList.value.find((item: any) => item.value === val);
  formData.value.userId = user.value;
  formData.value.userName = user.name;
  formData.value.staffName = user.remark;
  formRef.value.validateField('userId', () => null);
}
/**
 * 解锁事件
 */
function handleUnlock() {
  unlockDialogRef.value.show(formData.value);
}
/**
 * 报工
 * @param {*} val
 */
function modify(isFinish?: boolean) {
  formData.value.investmentNum = formData.value.quantityTask;
  // val.quantityFeedback = val.quantityFeedback
  return new Promise((resolve, reject) => {
    saveWorkFeedback({
      ...formData.value,
      feedbackId: undefined, // 记录主键ID
      feedbackType: 1, // 报工类型 1-自行报工 2-统一报工
      feedbackTypeName: '自行报工', // 报工类型 1-自行报工 2-统一报工
      workstationId: formData.value.workstationId
        ? formData.value.workstationId
        : '00000000-0000-0000-0000-000000000000', // 工作站ID
      workstationCode: formData.value.workstationCode, // 工作站编码
      workstationName: formData.value.workstationName, // 工作站名称
      workshopId: formData.value.workshopId, // 车间ID
      workshopCode: formData.value.workshopCode, // 车间编码
      workshopName: formData.value.workshopName, // 车间名称
      machineryId: formData.value.machineryId, // 设备ID
      machineryCode: formData.value.machineryCode, // 设备编码
      machineryName: formData.value.machineryName, // 设备名称
      mouldId: formData.value.mouldId, // 模具ID
      mouldCode: formData.value.mouldCode, // 模具编码
      mouldName: formData.value.mouldName, // 模具名称
      workOrderId: erweimaData.value.workOrderId, // 生产工单ID
      workOrderCode: erweimaData.value.workOrderCode, // 生产工单编码
      workOrderName: erweimaData.value.workOrderName, // 生产工单名称
      taskId: formData.value.taskId, // 生产任务ID
      taskCode: formData.value.taskCode, // 生产任务编码
      taskName: formData.value.taskName, // 生产任务名称
      productId: erweimaData.value.productId, // 产品ID
      productCode: erweimaData.value.productName, // 产品编码
      productName: erweimaData.value.productId, // productCode
      specification: erweimaData.value.specification, // 规格型号
      unitOfMeasure: '', // 计量单位
      quantityTask: formData.value.quantityTask, // 排产数量/投入数量
      quantityFeedback: formData.value.quantity, // 本次报工数量(合格数量+不合格数量)
      quantityQualified: formData.value.quantityQualified, // 合格数量/产出数量
      quantityUnqualified: formData.value.quantityUnqualified, // 不合格数量，从子表自动计算
      userId: formData.value.userId, // 报工人员ID
      userName: formData.value.userName, // 报工人员账号
      staffName: formData.value.staffName, // 报工人员姓名
      feedbackChannel: 1, // 报工途径 1-PAD 2-手机 3-电脑
      feedbackChannelName: 'PAD', // 报工途径 1-PAD 2-手机 3-电脑
      feedbackTime: undefined, // 报工时间
      recordUserId: undefined, // 录入人员Id
      recordUserName: '', // 录入人员账号
      recordStaffName: '', // 录入人员姓名
      status: formData.value.status, // 状态 1-草稿 2-已提交
      remarks: '', // 备注
      unlockUserId: formData.value.unlockUserId, // 解锁人ID
      unlockStaffName: formData.value.unlockStaffName, // 解锁人姓名
      unlockReason: formData.value.unlockReason, // 解锁原因
    })
      .then(({ code }) => {
        // if (erweimaData.value.isAntecede === true) {
        //   xianxingClick(erweimaData.value)
        // } else {
        if (code === 0) {
          if (!isFinish) {
            emits('done');
          }
          resolve(code);
        }
        // }
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

onMounted(() => {
  getMouldListData();
  getMachineryListData();
  getOperatorListData();
  getQuantityQualifiedDeviationData();
});
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="formData"
      :rules="formRules"
      label-width="93px"
      label-suffix="："
      :inline="false"
    >
      <el-row :gutter="40">
        <ReCol24>
          <el-form-item>
            <div class="w-full flex justify-center">
              <el-button
                type="success"
                :disabled="!formData.canStart"
                :title="
                  erweimaData.taskStatus == 3 || erweimaData.taskStatus == 4
                    ? '工单已暂停或已结束'
                    : previousTask && previousTask.status != 4
                      ? '上一个工序未结束，不可开始。'
                      : formData.status === 2 || formData.status === 4
                        ? formData.statusName + '，不可开始'
                        : formData.issueStatus === 2
                          ? '请先领料'
                          : ''
                "
                @click="handleStart()"
              >
                开始
              </el-button>
              <el-button
                type="danger"
                :disabled="!formData.canFinish"
                :title="
                  erweimaData.taskStatus == 3 || erweimaData.taskStatus == 4
                    ? '工单已暂停或已结束'
                    : formData.status === 4 || formData.status === 1
                      ? formData.statusName + '，不可结束'
                      : formData.issueStatus === 2
                        ? '请先领料'
                        : ''
                "
                @click="handleEnd()"
              >
                结束
              </el-button>
              <el-input
                v-if="formData.issueStatus === 2"
                v-model="quantityNum"
                style="width: 260px; margin-left: 10px"
                placeholder="请输入生产数量"
              >
                <template v-if="false" #prepend> 生产数量 </template>
                <template v-if="formData.issueStatus === 2" #append>
                  <el-button
                    type="primary"
                    :disabled="!formData.canIssue"
                    :title="!formData.canIssue ? '领料不可用' : ''"
                    @click="handlePick()"
                  >
                    领料
                  </el-button>
                </template>
              </el-input>
              <el-button
                v-if="formData.receiptStatus === 2"
                type="primary"
                :disabled="
                  erweimaData.taskStatus == 3 ||
                  erweimaData.taskStatus == 4 ||
                  formData.status !== 4 ||
                  !formData.quantityQualified
                "
                :title="
                  erweimaData.taskStatus == 3 || erweimaData.taskStatus == 4
                    ? '工单已暂停或已结束'
                    : formData.status !== 4
                      ? '未结束，不可入库'
                      : !formData.quantityQualified
                        ? '产出数量为0，不可入库'
                        : ''
                "
                @click="handleReceipt()"
              >
                入库
              </el-button>
              <el-button
                v-if="formData.receiptStatus == 3"
                type="primary"
                @click="handleReceipt()"
              >
              入库查看
              </el-button>
            </div>
          </el-form-item>
        </ReCol24>
        <ReColForm>
          <el-form-item label="创建人">
            <el-input v-model="formData.creator" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="创建时间">
            <el-input v-model="formData.createTime" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="开始时间">
            <el-input v-model="formData.startTime" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="结束时间">
            <el-input v-model="formData.endTime" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="工序">
            <el-input v-model="formData.processName" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="顺序">
            <el-input v-model="formData.sequence" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="状态">
            <el-input v-model="formData.statusName" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="所属车间">
            <el-input v-model="formData.workshopName" disabled />
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="设备" prop="machineryId">
            <el-select
              v-model="formData.machineryId"
              placeholder="请选择"
              filterable
              :allow-create="false"
              style="width: 100%"
              :disabled="formData.status === 1 || formData.status === 4"
              :title="
                formData.status === 1
                  ? '未开始不可编辑'
                  : formData.status === 4
                    ? '已完成不可编辑'
                    : ''
              "
              @change="handleMachineryChange"
            >
              <el-option
                v-for="machinery in machineryList"
                :key="machinery.id"
                :label="machinery.name"
                :value="machinery.value"
              />
            </el-select>
          </el-form-item>
        </ReColForm>
        <ReColForm
          v-if="
            formData.processName.indexOf('成型') !== -1 &&
            formData.processName.indexOf('成型工检') === -1
          "
        >
          <el-form-item label="模具" prop="mouldId">
            <el-select
              v-model="formData.mouldId"
              placeholder="请选择"
              filterable
              :allow-create="false"
              style="width: 100%"
              :disabled="formData.status === 1 || formData.status === 4"
              :title="
                formData.status === 1
                  ? '未开始不可编辑'
                  : formData.status === 4
                    ? '已完成不可编辑'
                    : ''
              "
              @change="handleMouldChange"
            >
              <el-option
                v-for="mould in mouldList"
                :key="mould.id"
                :label="mould.name"
                :value="mould.value"
              />
            </el-select>
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="操作人" prop="userId">
            <el-select
              v-model="formData.userId"
              placeholder="请选择"
              filterable
              :allow-create="false"
              style="width: 100%"
              :disabled="formData.status === 1 || formData.status === 4"
              :title="
                formData.status === 1
                  ? '未开始不可编辑'
                  : formData.status === 4
                    ? '已完成不可编辑'
                    : ''
              "
              @change="handleUserChange"
            >
              <el-option
                v-for="operator in operatorList"
                :key="operator.value"
                :label="operator.remark"
                :value="operator.value"
              />
            </el-select>
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="投入数量">
            <el-input
              v-model="formData.quantity"
              :disabled="true"
              :title="
                formData.status === 1
                  ? '未开始不可编辑'
                  : formData.status === 4
                    ? '已完成不可编辑'
                    : ''
              "
              @change="modify()"
            >
              <!-- <template #suffix>
                总量：{{ formData.quantityTask }}
              </template> -->
            </el-input>
          </el-form-item>
        </ReColForm>
        <ReColForm>
          <el-form-item label="产出数量" prop="quantityQualified">
            <el-input
              v-model="formData.quantityQualified"
              :disabled="
                formData.status === 1 ||
                formData.status === 4 ||
                formData.unlockUserId !== '00000000-0000-0000-0000-000000000000'
              "
              :title="
                formData.status === 1
                  ? '未开始不可编辑'
                  : formData.status === 4
                    ? '已完成不可编辑'
                    : formData.unlockUserId !==
                        '00000000-0000-0000-0000-000000000000'
                      ? '解锁后无法修改产出数量'
                      : ''
              "
              @change="
                val => {
                  formData.quantityQualified = val
                    ? isNaN(parseFloat(val))
                      ? 0
                      : parseFloat(val)
                    : 0;
                }
              "
            >
              <template v-if="false" #suffix>
                <span> 总量：{{ formData.quantityFeedback }} </span>
              </template>
              <template #append>
                <el-button
                  type="primary"
                  :disabled="
                    erweimaData.taskStatus == 3 ||
                    erweimaData.taskStatus == 4 ||
                    formData.status === 1 ||
                    formData.status === 4
                  "
                  :title="
                    erweimaData.taskStatus == 3 || erweimaData.taskStatus == 4
                      ? '工单已暂停或已结束'
                      : formData.status === 1
                        ? '未开始，不可解锁'
                        : formData.status === 4
                          ? '已完成，不可解锁'
                          : ''
                  "
                  @click="handleUnlock()"
                >
                  解锁
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </ReColForm>
      </el-row>
    </el-form>
    <UnlockFormDialog
      ref="unlockDialogRef"
      :work-task="formData"
      :quantity="formData.quantity"
      :quantity-qualified-deviation="quantityQualifiedDeviation"
      @done="refreshData"
    />
    <ProductReceiptFormDialog ref="receiptDialogRef" @done="refreshData" />
    <PickingFormDialog
      ref="pickingDialogRef"
      :work-task="workTask"
      @done="refreshData"
    />
  </div>
</template>
