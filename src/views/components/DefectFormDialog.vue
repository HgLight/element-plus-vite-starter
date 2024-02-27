<script setup lang="ts">
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";

import { addWorkFeedbackDefect, getDefectListNv } from "~/api";

const emits = defineEmits(["done"]);
const formRules = {
  defectId: [{ required: true, message: "请选择不良品", trigger: "change" }],
  quantityUnqualified: [
    { required: true, trigger: "blur", message: "请输入数量" },
    {
      trigger: "blur",
      validator: (
        rule: any,
        value: string | number,
        callback: (arg0?: Error | undefined) => void
      ) => {
        if (value === "") {
          callback(new Error("请输入数量"));
        } else if (value === 0) {
          callback(new Error("数量不能为0!"));
        } else {
          callback();
        }
      },
    },
  ],
};

const ruleFormRef = ref();
const dialogVisible = ref(false);
const defectList = ref<Array<any>>([]);
const formData = ref({
  defectRecordId: undefined,
  feedbackId: undefined,
  taskId: undefined,
  defectId: undefined,
  defectCode: "",
  defectName: "",
  quantityUnqualified: 0,
  remarks: "",
});

function show(workTask: { taskId: undefined }, productLineType: any) {
  dialogVisible.value = true;
  nextTick(() => {
    formData.value.taskId = workTask.taskId;
    getDefectList(productLineType);
  });
}
defineExpose({ show });

function getDefectList(productLineType: any) {
  getDefectListNv({ sysOwnerCpy: "", state: "正常", productLineType }).then(
    res => {
      defectList.value = res.data;
    }
  );
}
function handleDefectChange(val: any) {
  const defect: any = defectList.value.find((item: any) => item.value === val);
  formData.value.defectCode = defect.code;
  formData.value.defectName = defect.name;
}
function submitForm() {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      addWorkFeedbackDefect(formData.value).then(({ code, message }) => {
        if (code === 0) {
          ElMessage.success(message);
          emits("done", formData.value.taskId);
          dialogVisible.value = false;
          resetForm();
        }
      });
    }
  });
}
function resetForm() {
  ruleFormRef.value.resetFields();
}
function handleClose() {
  resetForm();
}
</script>

<template>
  <el-dialog
    title="不良品添加"
    v-model="dialogVisible"
    :modal="false"
    append-to-body
    width="560px"
    @close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      label-width="80px"
      label-suffix="："
      :inline="false"
      :model="formData"
      :rules="formRules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="不良品" prop="defectId">
            <el-select
              v-model="formData.defectId"
              placeholder="请选择不良品"
              filterable
              :allow-create="false"
              style="width: 100%"
              @change="handleDefectChange"
            >
              <el-option
                v-for="item in defectList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量" prop="quantityUnqualified">
            <el-input
              v-model="formData.quantityUnqualified"
              autocomplete="off"
              @change="
                val => {
                  formData.quantityUnqualified = val
                    ? isNaN(parseInt(val))
                      ? 0
                      : parseInt(val)
                    : 0;
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="formData.remarks"
              placeholder="请输入备注"
              show-word-limit
              maxlength="255"
              type="textarea"
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
~/api
