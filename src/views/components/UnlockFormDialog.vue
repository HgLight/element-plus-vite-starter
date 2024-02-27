<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch, nextTick } from "vue";

import md5 from "~/utils/md5";
import { postLogin, saveWorkFeedback } from "~/api";
import { useAppStoreHook } from "~/store/modules/app";

const props = defineProps({
  quantityQualifiedDeviation: {
    type: Number,
    required: true,
    default: 0,
  },
});
const emits = defineEmits(["done"]);
const { erweimaData } = storeToRefs(useAppStoreHook());

const formRef = ref();
const deviation = ref(0);
const userInfo = ref<any>();
const workTask = ref<any>({});
const dialogVisible = ref(false);
const formData = ref({
  loginName: "", // 解锁账号
  password: "", // 解锁密码
  Remark: "", // 解锁原因
  ccSl: 0, // 产出数量
});
const formRules = ref({
  loginName: [
    { required: true, message: "请输入账号", trigger: "blur" },
    {
      trigger: "blur",
      validator: loginNameValidator,
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      trigger: "blur",
      validator: passwordValidator,
    },
  ],
  Remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
  ccSl: [
    {
      trigger: "blur",
      validator: ccSlValidator,
    },
  ],
});

watch(
  () => props.quantityQualifiedDeviation,
  val => {
    deviation.value = val;
  },
  {
    immediate: true,
  }
);

function show(currentTask: any) {
  dialogVisible.value = true;
  workTask.value = currentTask;
  formData.value.ccSl = currentTask.quantityQualified;
}
defineExpose({ show });

function loginNameValidator(
  rule: any,
  value: any,
  callback: (arg0?: Error | undefined) => void
) {
  if (formData.value.password !== "") {
    loginByUsername()
      .then(({ code, message }) => {
        if (code === 0) {
          callback();
        } else {
          callback(new Error(message));
        }
      })
      .catch(() => {
        callback(new Error("账号或密码错误"));
      });
  } else {
    callback();
  }
}
function passwordValidator(
  rule: any,
  value: any,
  callback: (arg0?: Error | undefined) => void
) {
  if (formData.value.loginName !== "") {
    loginByUsername()
      .then(({ code, message }) => {
        if (code === 0) {
          setTimeout(() => {
            nextTick(() => {
              formRef.value.validateField("loginName", (err: any) => {
                console.log(err);
                callback();
              });
            });
          }, 300);
        } else {
          callback(new Error(message));
        }
      })
      .catch(() => {
        callback(new Error("账号或密码错误"));
      });
  } else {
    callback();
  }
}
function ccSlValidator(
  rule: any,
  value: any,
  callback: (arg0?: Error | undefined) => void
) {
  if (value === "") {
    callback(new Error("请输入产出数量"));
  } else if (value <= 0) {
    callback(new Error("产出数量不能小于等于0!"));
  } else if (
    (Math.abs(value - workTask.value.quantity) / workTask.value.quantity) *
      100 <=
    deviation.value
  ) {
    // callback(new Error('产出数量包含在百分之' + deviation.value + ',无需要解锁。'))
    callback();
  } else {
    callback();
  }
}
/** 登入 */
function loginByUsername() {
  return new Promise<any>((resolve, reject) => {
    postLogin({
      loginName: formData.value.loginName,
      password: md5(formData.value.loginName, formData.value.password),
    })
      .then(data => {
        console.log("data", data);
        userInfo.value = data.data;
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}
function submitForm() {
  formRef.value.validate((valid: any) => {
    if (valid) {
      const val = workTask.value;
      workTask.value.attribute3 = formData.value.Remark;
      workTask.value.attribute2 = formData.value.password;
      workTask.value.quantityFeedback = formData.value.ccSl;
      saveWorkFeedback({
        ...val,
        feedbackId: undefined, // 记录主键ID
        feedbackType: 1, // 报工类型 1-自行报工 2-统一报工
        feedbackTypeName: "自行报工", // 报工类型 1-自行报工 2-统一报工
        workstationId: val.workstationId
          ? val.workstationId
          : "00000000-0000-0000-0000-000000000000", // 工作站ID
        workstationCode: val.workstationCode, // 工作站编码
        workstationName: val.workstationName, // 工作站名称
        workshopId: val.workshopId, // 车间ID
        workshopCode: val.workshopCode, // 车间编码
        workshopName: val.workshopName, // 车间名称
        machineryId: val.machineryId
          ? val.machineryId
          : "00000000-0000-0000-0000-000000000000", // 设备ID
        machineryCode: val.machineryCode, // 设备编码
        machineryName: val.machineryName, // 设备名称
        mouldId: val.mouldId, // 模具ID
        mouldCode: val.mouldCode, // 模具编码
        mouldName: val.mouldName, // 模具名称
        workOrderId: erweimaData.value.workOrderId, // 生产工单ID
        workOrderCode: erweimaData.value.workOrderCode, // 生产工单编码
        workOrderName: erweimaData.value.workOrderName, // 生产工单名称
        taskId: val.taskId, // 生产任务ID
        taskCode: val.taskCode, // 生产任务编码
        taskName: val.taskName, // 生产任务名称
        productId: erweimaData.value.productId, // 产品ID
        productCode: erweimaData.value.productName, // 产品编码
        productName: erweimaData.value.productId, // productCode
        specification: erweimaData.value.specification, // 规格型号
        unitOfMeasure: "", // 计量单位
        quantityTask: val.quantityTask, // 排产数量/投入数量
        quantityFeedback: val.quantity, // 本次报工数量(合格数量+不合格数量)
        quantityQualified: formData.value.ccSl, // 合格数量/产出数量
        quantityUnqualified: val.quantityUnqualified, // 不合格数量，从子表自动计算
        userId: val.userId, // 报工人员ID
        userName: val.userName, // 报工人员账号
        staffName: val.staffName, // 报工人员姓名
        feedbackChannel: 1, // 报工途径 1-PAD 2-手机 3-电脑
        feedbackChannelName: "PAD", // 报工途径 1-PAD 2-手机 3-电脑
        feedbackTime: undefined, // 报工时间
        recordUserId: undefined, // 录入人员Id
        recordUserName: "", // 录入人员账号
        recordStaffName: "", // 录入人员姓名
        status: val.status, // 状态 1-草稿 2-已提交
        remarks: "", // 备注
        unlockUserId: userInfo.value.userId, // 解锁人ID
        unlockStaffName: userInfo.value.staffName, // 解锁人姓名
        unlockReason: formData.value.Remark, // 解锁原因
      }).then(({ code }) => {
        // if (erweimaData.value.isAntecede === true) {
        //   xianxingClick(erweimaData.value)
        // } else {
        if (code === 0) {
          emits("done", workTask.value);
          formRef.value.resetFields();
          dialogVisible.value = false;
        }
        // }
      });
    }
  });
}
function handleClose() {
  formRef.value.resetFields();
}
</script>

<template>
  <el-dialog
    title="确认解锁"
    v-model="dialogVisible"
    :modal="false"
    append-to-body
    width="668px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      label-width="96px"
      label-suffix="："
      :inline="false"
      :model="formData"
      :rules="formRules"
    >
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item label="投入数量" prop="quantity">
            <el-input v-model="workTask.quantity" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="浮动百分比" prop="deviation">
            <el-input v-model="deviation" disabled>
              <template #suffix>
                <span style="line-height: 40px"> % </span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号" prop="loginName">
            <el-input v-model="formData.loginName" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              show-password
              autocomplete="off"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产出数量" prop="ccSl">
            <el-input-number
              v-model="formData.ccSl"
              @change="
                (val: any) => {
                  formData.ccSl = val
                    ? isNaN(parseFloat(val))
                      ? 0
                      : parseFloat(val)
                    : 0;
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="解锁原因" prop="Remark">
            <el-input
              v-model="formData.Remark"
              autocomplete="off"
              type="textarea"
              :rows="3"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false"> 取 消 </el-button>
        <el-button type="primary" @click="submitForm"> 确 定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
~/api
