<script setup lang="ts">
import dayjs from 'dayjs';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

import { useAppStoreHook } from '~/store/modules/app';
import {
  addProductReceiptHeader,
  getWarehouseTree,
  generateCode,
  getProductDetail,
  exportExcel,
} from '~/api';

const emits = defineEmits(['done']);
const formRules = {
  receiptName: [
    { required: true, message: '入库单名称不能为空', trigger: 'blur' },
  ],
  receiptCode: [
    { required: true, message: '入库单编号不能为空', trigger: 'blur' },
  ],
  workOrderId: [
    { required: true, message: '生产工单不能为空', trigger: 'change' },
  ],
};
const defaultProps = {
  value: 'value',
  label: 'name',
  children: 'children',
};
const { erweimaData } = storeToRefs(useAppStoreHook());

const ruleFormRef = ref();
const currentTask = ref();
const showType = ref('add');
const exporting = ref(true);
const warehouseOptions = ref([]);
const dialogVisible = ref(false);
const formData = ref<any>({
  receiptId: undefined, // 入库单主键ID
  receiptCode: '', // 入库单编码
  receiptName: '', // 入库单名称
  workOrderId: '', // 生产工单ID
  workOrderCode: '', // 生产工单编号
  workOrderName: '', // 生产工单名称
  receiptType: 1, // 入库类型 1-生产入库 2-退货入库 9-其它入库
  receiptDate: '', // 入库日期
  status: 0, // 单据状态
  remarks: '', // 备注
  productReceiptRows: [], // 产品入库单明细
});

function show(_currentTask: any) {
  getWarehouseNVData();
  formData.value.receiptDate = dayjs(new Date().toISOString()).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  dialogVisible.value = true;
  currentTask.value = _currentTask;
  handleAutoClick();
  formData.value.workOrderId = erweimaData.value.workOrderId;
  formData.value.workOrderName = erweimaData.value.workOrderName;
  formData.value.workOrderCode = erweimaData.value.workOrderCode;
  formData.value.receiptDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
  formData.value.productReceiptRows = [
    {
      rowId: undefined, // 行主键ID
      receiptId: undefined, // 入库单ID
      productId: erweimaData.value.productId, // 产品ID
      productCode: erweimaData.value.productCode, // 产品编码
      productName: erweimaData.value.productName, // 产品名称
      specification: erweimaData.value.specification, // 规格型号
      unitOfMeasure: erweimaData.value.unitOfMeasure, // 单位
      quantityReceipt: _currentTask.quantityProduced, // 入库数量
      quantityPackage: 0, // 出货数量（已装箱数量）
      batchCode: erweimaData.value.workOrderCode, // 批次编号，可以根据配置的规则，由系统自动生成；也可以手工填写
      warehouseId: '', // 仓库ID
      warehouseCode: '', // 仓库编码
      warehouseName: '', // 仓库名称
      whsAreaId: '', // 库区ID
      whsAreaCode: '', // 库区编码
      whsAreaName: '', // 库区名称
      whsLocationId: '', // 库位ID
      whsLocationCode: '', // 库位编码
      whsLocationName: '', // 库位名称
      producedDate: dayjs(_currentTask.feedbackTime).format('YYYY-MM-DD'), // 生产日期
      expireDate: '', // 有效期
      remarks: '', // 备注
      warehouseALs: [],
    },
  ];
  getProductData();
}
defineExpose({ show });

function handleQr(row: {
  materialName: string;
  batchCode: string;
  quantityReceipt: any;
}) {
  exporting.value = true;
  const fileName = row.materialName + '-' + row.batchCode + '二维码';
  exportExcel(
    '/api/MaterialReceiptRow/GenQrCodeForGY?',
    fileName,
    {
      productCode: erweimaData.value.productCode,
      quantity: row.quantityReceipt,
      workOrderCode: formData.value.workOrderCode,
    },
    undefined
  ).finally(() => {
    exporting.value = false;
  });
}
function handleAutoClick() {
  generateCode({
    ruleCode: 'rc_prod_recept',
    inputChar: '',
  })
    .then(({ data }) => {
      formData.value.receiptCode = data || '';
      formData.value.receiptName = data || '';
    })
    .catch(() => {
      formData.value.receiptCode = '';
      formData.value.receiptName = '';
    })
    .finally(() => {});
}
function getProductData() {
  getProductDetail({ id: erweimaData.value.productId })
    .then(({ data }) => {
      formData.value.productReceiptRows[0].warehouseId = data.warehouseId;
      formData.value.productReceiptRows[0].warehouseCode = data.warehouseCode;
      formData.value.productReceiptRows[0].warehouseName = data.warehouseName;
      formData.value.productReceiptRows[0].whsAreaId = data.areaId;
      formData.value.productReceiptRows[0].whsAreaCode = data.areaCode;
      formData.value.productReceiptRows[0].whsAreaName = data.areaName;
      formData.value.productReceiptRows[0].whsLocationId = data.whsLocationId;
      formData.value.productReceiptRows[0].whsLocationCode =
        data.whsLocationCode;
      formData.value.productReceiptRows[0].whsLocationName =
        data.whsLocationName;
      formData.value.productReceiptRows[0].unitOfMeasure = data.unitOfMeasure;
      formData.value.productReceiptRows[0].warehouseALs = [
        data.warehouseId,
        data.areaId,
        '',
      ];
    })
    .catch(() => {
      formData.value.productReceiptRows[0].warehouseId = '';
      formData.value.productReceiptRows[0].warehouseCode = '';
      formData.value.productReceiptRows[0].warehouseName = '';
      formData.value.productReceiptRows[0].whsAreaId = '';
      formData.value.productReceiptRows[0].whsAreaCode = '';
      formData.value.productReceiptRows[0].whsAreaName = '';
      formData.value.productReceiptRows[0].whsLocationId = '';
      formData.value.productReceiptRows[0].whsLocationCode = '';
      formData.value.productReceiptRows[0].whsLocationName = '';
      formData.value.productReceiptRows[0].unitOfMeasure = '';
      formData.value.productReceiptRows[0].warehouseALs = [];
    })
    .finally(() => {
      console.log(
        'formData.value.productReceiptRows[0].warehouseALs',
        formData.value.productReceiptRows[0].warehouseALs
      );
    });
}
/**
 * 获取仓库树NV
 */
function getWarehouseNVData() {
  getWarehouseTree({ isSearch: 0 })
    .then(({ data }) => {
      warehouseOptions.value = data || [];
      console.log(warehouseOptions.value);
    })
    .catch(() => {
      warehouseOptions.value = [];
    })
    .finally(() => {
      // rebuildTree(warehouseOptions.value)
      console.log('warehouseOptions.value', warehouseOptions.value);
    });
}
function rebuildTree(warehouseOptions: any[]) {
  warehouseOptions.forEach((item: any) => {
    if (item.children.length < 1) {
      delete item.children;
    } else {
      rebuildTree(item.children);
    }
  });
  console.log(warehouseOptions);
}
function handleChange(
  val: any,
  row: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    whsAreaId: string;
    whsAreaCode: string;
    whsAreaName: string;
    whsLocationId: string;
    whsLocationCode: string;
    whsLocationName: string;
  }
) {
  if (val != null && val.length > 0) {
    warehouseOptions.value.forEach(
      (item: { value: any; code: null; name: any; children: any[] | null }) => {
        if (item.value === val[0]) {
          row.warehouseId = item.value;
          row.warehouseCode = item.code == null ? '' : item.code;
          row.warehouseName = item.name;
        }
        if (item.children != null && item.children.length > 0) {
          item.children.forEach(
            (sitem: {
              value: any;
              code: any;
              name: any;
              children: any[] | null;
            }) => {
              if (sitem.value === val[1]) {
                row.whsAreaId = sitem.value;
                row.whsAreaCode = sitem.code;
                row.whsAreaName = sitem.name;
              }
              if (sitem.children != null && sitem.children.length > 0) {
                sitem.children.forEach(
                  (titem: { value: any; code: any; name: any }) => {
                    if (titem.value === val[2]) {
                      row.whsLocationId = titem.value;
                      row.whsLocationCode = titem.code;
                      row.whsLocationName = titem.name;
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    row.warehouseId = '';
    row.warehouseCode = '';
    row.warehouseName = '';
    row.whsAreaId = '';
    row.whsAreaCode = '';
    row.whsAreaName = '';
    row.whsLocationId = '';
    row.whsLocationCode = '';
    row.whsLocationName = '';
  }
}
function submitForm(this: any) {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      // let ishave0 = false
      // for (let i = 0; i < formData.value.productReceiptRows.length; i++) {
      //   const item = formData.value.productReceiptRows[i]
      //   if (item.expireDate === '' || item.expireDate == null) {
      //     ishave0 = true
      //     break
      //   }
      // }
      // if (ishave0) {
      //   ElMessage.warning('存在有效期未填的产品，请填写')
      //   return
      // }
      formData.value.status = 2;
      addProductReceiptHeader(formData.value)
        .then(({ code, message }) => {
          if (code === 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm();
            emits('done');
          }
        })
        .finally(() => {});
    }
  });
}
function resetForm(this: any) {
  ruleFormRef.value.resetFields();
  formData.value.productReceiptRows = [];
}
</script>

<template>
  <el-dialog
    title="产品入库"
    v-model="dialogVisible"
    :modal="false"
    append-to-body
    width="1151px"
    @close="resetForm"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="40">
        <el-col :span="8" :offset="0">
          <el-form-item label="入库单编码" prop="receiptCode">
            <el-input
              v-model.trim="formData.receiptCode"
              :readonly="showType == 'read'"
              placeholder="入库单编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="入库单名称" prop="receiptName">
            <el-input
              v-model.trim="formData.receiptName"
              :readonly="showType == 'read'"
              placeholder="入库单名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="工单编码" prop="workOrderCode">
            <el-input v-model="formData.workOrderCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="入库时间" prop="receiptDate">
            <el-date-picker
              v-model="formData.receiptDate"
              type="date"
              :disabled="showType == 'read'"
              placeholder="请选择"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :clearable="false"
              :editable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model.trim="formData.remarks"
              :readonly="showType == 'read'"
              type="textarea"
              :rows="2"
              placeholder="备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label-width="0px">
            <el-table
              border
              :height="240"
              highlight-current-row
              :data="formData.productReceiptRows"
            >
              <el-table-column
                v-if="false"
                type="selection"
                align="center"
                width="60"
              />
              <el-table-column
                fixed="left"
                type="index"
                label="序号"
                align="center"
                width="60"
              />
              <el-table-column
                fixed="left"
                label="产品编码"
                align="center"
                prop="productCode"
                width="150"
                show-overflow-tooltip
              />
              <el-table-column
                fixed="left"
                label="产品名称"
                width="160"
                align="center"
                prop="productName"
                show-overflow-tooltip
              />
              <el-table-column
                label="规格型号"
                align="center"
                prop="specification"
                width="160"
                show-overflow-tooltip
              />
              <el-table-column
                label="单位"
                align="center"
                prop="unitOfMeasure"
                width="100"
                show-overflow-tooltip
              />
              <el-table-column
                label="入库数量"
                align="center"
                prop="quantityReceipt"
                width="100"
                show-overflow-tooltip
              />
              <el-table-column
                v-if="false"
                label="装箱数量"
                align="center"
                prop="quantityPackage"
                width="100"
                show-overflow-tooltip
              />
              <!-- <template #default="{ row }">
                      <el-input-number
                        v-if="row.isNew || row.isEdit"
                        v-model.trim="row.quantityReceipt"
                        :max="row.quantityReceived"
                        :controls="false"
                        :precision="0"
                        step-strictly
                        value-on-clear="min"
                        placeholder="0"
                      />
                      <span v-else>{{ row.quantityReceipt }}</span>
                    </template>
                  </el-table-column> -->
              <el-table-column
                label="仓库/区/位"
                align="center"
                width="220"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <el-cascader
                    v-if="false"
                    v-model="row.warehouseALs"
                    :options="warehouseOptions"
                    :props="defaultProps"
                    clearable
                    @change="handleChange($event, row)"
                  >
                    <template #default="{ node, data }">
                      <span>{{ data.name }}</span>
                      <span v-if="!node.isLeaf">
                        ({{ data.children.length }})
                      </span>
                    </template>
                  </el-cascader>
                  <span v-else
                    >{{ row.warehouseName }}/{{
                      row.whsAreaName == '' ? '-' : row.whsAreaName
                    }}/{{
                      row.whsLocationName == '' ? '-' : row.whsLocationName
                    }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column
                label="批次编号"
                align="center"
                prop="batchCode"
                width="100"
                show-overflow-tooltip
              />
              <el-table-column
                v-if="false"
                label="有效期"
                align="center"
                width="190"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <el-date-picker
                    v-if="row.isNew || row.isEdit"
                    v-model="row.expireDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 160px"
                    placeholder="有效期"
                  />
                  <span v-else>{{
                    row.expireDate != ''
                      ? dayjs(row.expireDate).format('YYYY-MM-dd')
                      : ''
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="备注"
                align="center"
                prop="remarks"
                min-width="160"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <el-input
                    v-if="row.isNew || row.isEdit"
                    v-model.trim="row.remarks"
                    placeholder=""
                  />
                  <span v-else>{{ row.remarks }}</span>
                </template>
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                :width="120"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    :loading="row.exporting"
                    @click="handleQr(row)"
                  >
                    生成二维码
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
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
