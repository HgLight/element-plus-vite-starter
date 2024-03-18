<script setup lang="ts">
import dayjs from 'dayjs';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

import {
  addIssueHeader,
  getWorkstationListNv,
  generateCode,
  getWorkOrderBomTempList,
} from '~/api';
import { useAppStoreHook } from '~/store/modules/app';
import type { BOMItem, PickingFormData } from './PickingTypes';

const props = defineProps({
  workTask: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['done']);

const { bomTableData, erweimaData } = storeToRefs(useAppStoreHook());

const ruleFormRef = ref();
const loading = ref(false);
const saomaOpen = ref(true);
const dialogVisible = ref(false);
const isBeforehand = ref(false);
// const lingliaoData=ref( [])
const workStations = ref<Array<any>>([]);
const tableData = ref<Array<BOMItem>>([]);
const formData = ref<PickingFormData>({
  /** 【数据库字段】领料单主键ID */
  issueId: undefined,
  /** 【数据库字段】领料单编号 */
  issueCode: '',
  /** 【数据库字段】领料单名称 */
  issueName: '',
  /** 【数据库字段】工作站ID */
  workstationId: undefined,
  /** 【数据库字段】工作站编号 */
  workstationCode: '',
  /** 【数据库字段】工作站名称 */
  workstationName: '',
  /** 【数据库字段】生产工单ID */
  workOrderId: undefined,
  /** 【数据库字段】生产工单编号 */
  workOrderCode: '',
  /** 【数据库字段】生产工单名称 */
  workOrderName: '',
  /** 【数据库字段】产品数量（缺省和生产工单中生产数量一致，领料时可调整，此值为调整后数量，产品入库时缺省数量为此值） */
  quantityProduct: 0,
  /** 【数据库字段】生产任务ID */
  taskId: '',
  /** 【数据库字段】生产任务编码 */
  taskCode: '',
  /** 【数据库字段】客户ID */
  clientId: undefined,
  /** 【数据库字段】客户编码 */
  clientCode: '',
  /** 【数据库字段】客户名称 */
  clientName: '',
  /** 【数据库字段】客户简称 */
  clientNick: '',
  /** 【数据库字段】领料日期 */
  issueDate: '',
  /** 【数据库字段】单据状态 1-草稿 2-已提交 */
  status: 2,
  /** 【数据库字段】物料出库类型 1-领料出库 9-其他出库 */
  materialOutType: 1,
  /** 【数据库字段】备注 */
  remarks: '',
  /** 【数据库字段】创建人 */
  creator: '',
  /** 【数据库字段】创建时间 */
  createTime: undefined,
  /** 【数据库字段】修改人 */
  modifier: '',
  /** 【数据库字段】修改时间 */
  modifyTime: undefined,
  /** 提交生产领料单明细 */
  materialIssueRows: [
    {
      /** 物料ID */
      materialId: '',
      /** 物料入库单明细ID，多个以逗号','分隔 */
      materialReceiptRowIds: '',
      /** 领料数量 */
      quantityTotalIssued: 0,
      /** 来自于生产BOM/产品BOM中的 物料isReuse属性 */
      isReuse: false,
      /** 是否需要进行回料入库处理 */
      isReceipt: false,
    },
  ],
});
const formRules = ref({
  issueName: [
    { required: true, message: '生产领料单名称不能为空', trigger: 'blur' },
  ],
  issueCode: [
    { required: true, message: '生产领料单编码不能为空', trigger: 'blur' },
  ],
  workOrderId: [
    { required: true, message: '生产工单不能为空', trigger: 'change' },
  ],
  issueDate: [
    { required: true, message: '生产领料日期不能为空', trigger: 'change' },
  ],
});

function show(_currentTask: any, quantityNum: number, _isBeforehand: boolean) {
  getIssueCode();
  getWorkStationData();
  dialogVisible.value = true;
  formData.value.workOrderId = erweimaData.value.workOrderId;
  formData.value.workOrderName = erweimaData.value.workOrderName;
  formData.value.workOrderCode = erweimaData.value.workOrderCode;
  formData.value.quantityProduct = quantityNum;
  formData.value.taskId = _currentTask.taskId;
  formData.value.taskCode = _currentTask.taskCode;
  formData.value.clientId = erweimaData.value.clientId;
  formData.value.clientCode = erweimaData.value.clientCode;
  formData.value.clientName = erweimaData.value.clientName;
  formData.value.clientNick = erweimaData.value.clientNick;
  formData.value.issueDate = dayjs().format('YYYY-MM-DD');
  isBeforehand.value = _isBeforehand;
  getDatas();
}
defineExpose({ show });

function getIssueCode() {
  generateCode({
    ruleCode: 'rc_prod_issue',
    inputChar: '',
  })
    .then(({ data }) => {
      formData.value.issueCode = data || '';
      formData.value.issueName = data || '';
    })
    .catch(() => {
      formData.value.issueCode = '';
      formData.value.issueName = '';
    })
    .finally(() => {});
}
function getWorkStationData() {
  getWorkstationListNv({ isSearch: 0 })
    .then(({ data }) => {
      workStations.value = data || [];
    })
    .catch(() => {
      workStations.value = [];
    })
    .finally(() => {});
}
function handleWorkStationChange(val: any) {
  workStations.value.forEach(item => {
    if (item.value === val) {
      formData.value.workstationId = item.value;
      formData.value.workstationCode = item.code;
      formData.value.workstationName = item.name;
    }
  });
}
function getDatas() {
  getWorkOrderBomTempList({
    productId: erweimaData.value.productId,
    processId: props.workTask.processId,
    workOrderQty: formData.value.quantityProduct,
  })
    .then(({ data }) => {
      const list = data || [];
      const _tableData = JSON.parse(JSON.stringify(bomTableData.value));
      tableData.value = [];
      _tableData.forEach((item: any) => {
        list.forEach(
          (sitem: {
            materialId: any;
            processId: any;
            thresholdMax: any;
            quantityMrp: any;
          }) => {
            if (
              item.materialId === sitem.materialId &&
              item.processId === sitem.processId
            ) {
              item.batchCodeStr = '';
              item.batchCodeScanStr = '';
              item.batchCodeArray = [];
              item.thresholdMax = sitem.thresholdMax;
              item.quantityMrp = sitem.quantityMrp;
              tableData.value.push(item);
            }
          }
        );
      });
      //再生料下标
      const isReuseIndex = tableData.value.findIndex(
        (item: { isReuse: any }) => item.isReuse
      );
      if (isReuseIndex !== -1) {
        const reuseData = JSON.parse(
          JSON.stringify(tableData.value[isReuseIndex])
        );
        reuseData.isReceipt = true;
        tableData.value.splice(isReuseIndex + 1, 0, reuseData);
      }
      console.log('tableData', tableData.value);
      // if (isBeforehand.value) {
      //   lingliaoData.value = res.data.data
      //   const canLingliaoData = lingliaoData.value.filter(i => i.type === true)
      //   if (canLingliaoData.length > 0) {
      //     const skModel = canLingliaoData[0]
      //     lingliaoData.value.push(skModel)
      //   }
      //   lingliaoData.value.forEach(r => {
      //     r.numberList.forEach(c => {
      //       c.batchNumberName = ' 批次号：' + c.batchNumber + ',数量' + c.sqt
      //     })
      //   })
      // } else {
      //   lingliaoData.value = res.data.data
      //   const canLingliaoData = lingliaoData.value.filter(i => i.type === true)
      //   if (canLingliaoData.length > 0) {
      //     const skModel = JSON.parse(JSON.stringify(canLingliaoData[0]))
      //     lingliaoData.value.push(skModel)
      //   }
      //   lingliaoData.value.forEach(r => {
      //     r.numberList.forEach(c => {
      //       c.batchNumberName = ' 批次号：' + c.batchNumber + ',数量' + c.sqt
      //     })
      //   })
      //   const sk = JSON.parse(JSON.stringify(canLingliaoData))
      //   const sg = JSON.parse(JSON.stringify(lingliaoData.value.filter(i => i.type === false)))
      //   lingliaoData.value = [...sk, ...sg]
      // }
    })
    .catch(err => {
      console.log(err);
    });
}
function handleBatchCodeScanChange(
  val: string | null | undefined,
  row: {
    materialReceiptRows: any[];
    batchCodeArray: any[];
    batchCodeScanStr: string;
    batchCodeStr: any;
  }
) {
  // row.materialReceiptRows
  if (val !== null && val !== '' && val !== undefined) {
    const codeArr = val.split(',');
    let codeStr = '';
    if (codeArr !== null && codeArr !== undefined && codeArr.length > 0) {
      codeStr = codeArr[0];
    }
    if (codeStr !== null && codeStr !== '' && codeStr !== undefined) {
      const materialReceiptRow = row.materialReceiptRows.find(
        (item: { batchCode: string }) => item.batchCode === codeStr
      );
      if (materialReceiptRow) {
        const batchCode = row.batchCodeArray.find(
          (item: any) => item === materialReceiptRow.rowId
        );
        if (batchCode) {
          ElMessage.warning('该物料批次号已选择,不可重复选择。');
        } else {
          row.batchCodeArray.push(materialReceiptRow.rowId);
          ElMessage.success('选择该物料批次号成功');
          row.batchCodeScanStr = '';
          row.batchCodeStr = row.batchCodeArray.join();
          console.log('111', row.batchCodeStr);
        }
      } else {
        ElMessage.warning('该物料批次号不存在');
      }
    }
  } else {
  }
  console.log('333', row.batchCodeStr);
}
function handleBatchCodeSelectChange(
  val: any[],
  row: { batchCodeStr: any; materialReceiptRows: any }
) {
  console.log('val---->', val);
  console.log('row---->', row);
  row.batchCodeStr = val.join();
  console.log('222', row.batchCodeStr);
  if (row && row.materialReceiptRows) {
    // const total = 0;
    // const isEnough = false;
    // const batchCodes = [];
    // if (val != null) {
    //   if (val.length > 1) {
    //     for (let i = 0; i < val.length; i++) {
    //       const rowid = val[i];
    //       if (i == 0) {
    //         batchCodes.push(rowid);
    //       } else {
    //         if (isEnough) {
    //           row.batchCodeArray = batchCodes;
    //           break;
    //         }
    //         batchCodes.push(rowid);
    //       }
    //       for (let j = 0; j < row.materialReceiptRows.length; j++) {
    //         const item = row.materialReceiptRows[j];
    //         total += item.quantityOnHand;
    //         if (item.rowId == rowid && total >= row.quantityMrp) {
    //           ElMessage.warning(
    //             "当前批次库存量以满足领料数量，无需选择多个批次"
    //           );
    //           isEnough = true;
    //           break;
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
function submitForm() {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      const hasQuantityIssuedNull = tableData.value.find(
        (item: any) =>
          item.materialName.indexOf('再生') == -1 &&
          item.materialCode.indexOf('再生') == -1 &&
          !item.isReceipt &&
          (item.quantityMrp === 0 ||
            item.quantityMrp === null ||
            item.quantityMrp === undefined)
      );
      if (hasQuantityIssuedNull) {
        ElMessage.warning('存在领料数量为空的数据');
        return;
      }

      const hasBatchCodeNull = tableData.value.find(
        (item: { batchCodeStr: string | null }) =>
          item.batchCodeStr === '' || item.batchCodeStr === null
      );
      if (hasBatchCodeNull) {
        ElMessage.warning('存在批次号未选的物料，请选择');
        return;
      }

      formData.value.materialIssueRows = tableData.value.map((item: any) => {
        const {
          materialId,
          processId,
          isReuse,
          isReceipt,
          batchCodeStr,
          quantityMrp,
          thresholdMax,
        } = item;
        return {
          materialId,
          processId,
          isReuse,
          isReceipt,
          thresholdMax,
          materialReceiptRowIds: batchCodeStr,
          quantityTotalIssued: quantityMrp,
        };
      });
      console.log('formData.value', formData.value);
      addIssueHeader(formData.value)
        .then(({ code, message }) => {
          if (code === 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            emits('done');
          }
        })
        .finally(() => {
          loading.value = false;
        });
      // lingliaoData.value.forEach((x) => {
      //   x.itemId = x.itemCode
      //   x.stcokNum = x.quantityMrp
      // })
      // if (!saomaOpen.value) {
      //   console.log(1)
      //   lingliaoData.value.forEach((x) => {
      //     const val = x.batchNumbers.split('_')[0]
      //     x.batchNumbers = []
      //     x.batchNumbers.push(val)
      //   })
      // }
      // addIssueHeader({
      //   pickingVos: lingliaoData.value,
      //   type: 'scllck'
      // })
      //   .then((res) => {
      //     if (res.data.code === -1000) {
      //       ElMessage.error(res.data.msg)
      //       return
      //     }
      //        emits("done")
      //     dialogVisible.value = false
      //   })
      //   .catch((err) => {
      //     console.log(err)
      //   })
    }
  });
}
</script>

<template>
  <el-dialog
    title="领料"
    v-model="dialogVisible"
    :modal="false"
    append-to-body
    width="1321px"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="40">
        <el-col :span="8" :offset="0">
          <el-form-item label="生产领料编码" prop="issueCode">
            <el-input
              v-model.trim="formData.issueCode"
              placeholder="生产领料编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="生产领料名称" prop="issueName">
            <el-input
              v-model.trim="formData.issueName"
              placeholder="生产领料名称"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="8" :offset="0">
          <el-form-item label="工作站" prop="workstationId">
            <el-select
              v-model="formData.workstationId"
              filterable
              placeholder="工作站"
              @change="handleWorkStationChange"
            >
              <el-option
                v-for="item in workStations"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="工单编码" prop="workOrderCode">
            <el-input
              v-model="formData.workOrderCode"
              placeholder=""
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="生产数量">
            <el-input v-model="formData.quantityProduct" type="number" disabled>
              <template #suffix>
                <span>{{ erweimaData.unitOfMeasure }}</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="8" :offset="0">
          <el-form-item label="客户">
            <el-input v-model.trim="formData.clientName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="领料日期" prop="issueDate">
            <el-date-picker
              v-model="formData.issueDate"
              type="date"
              placeholder="领料日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :editable="false"
              style="width: 100%"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model.trim="formData.remarks"
              type="textarea"
              :rows="2"
              placeholder="备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-table
            border
            :height="240"
            highlight-current-row
            :data="tableData"
          >
            <el-table-column
              fixed="left"
              type="index"
              label="序号"
              align="center"
              width="60"
            />
            <el-table-column
              fixed="left"
              label="物料编码"
              align="center"
              prop="materialCode"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column
              fixed="left"
              label="物料名称"
              width="160"
              align="center"
              prop="materialName"
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
              label="计量单位"
              align="center"
              prop="unitOfMeasure"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              v-if="false"
              fixed="left"
              label="仓库编号"
              width="160"
              align="center"
              prop="warehouseId"
              show-overflow-tooltip
            />
            <el-table-column
              label="领料数量"
              align="center"
              width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantityMrp"
                  :max="row.thresholdMax ? Infinity : Infinity"
                  :controls="false"
                  :min="0"
                  :disabled="false"
                  value-on-clear="min"
                  style="width: 100%"
                  class="quantity-issued-input"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-if="false"
              label="是否有回料"
              align="center"
              prop="isReuse"
              width="100"
            >
              <template #default="{ row }">
                {{ row.isReuse ? '是' : '否' }}
              </template>
            </el-table-column>
            <el-table-column
              label="批次编号"
              align="center"
              prop="batchCodeArray"
              min-width="320"
              show-overflow-tooltip
            >
              <template #header>
                批次编号
                <el-button
                  v-if="false"
                  style="margin-left: 10px"
                  type="primary"
                  @click="saomaOpen = !saomaOpen"
                >
                  {{ saomaOpen ? '扫码' : '选择' }}
                </el-button>
              </template>
              <template #default="{ row }">
                <el-select
                  v-if="saomaOpen"
                  v-model="row.batchCodeArray"
                  multiple
                  :filterable="!saomaOpen"
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择"
                  style="width: 100%"
                  @change="handleBatchCodeSelectChange($event, row)"
                >
                  <el-option
                    v-for="item in row.materialReceiptRows"
                    :key="item.rowId"
                    :label="
                      '批次号:' +
                      item.batchCode +
                      '，数量:' +
                      item.quantityOnHand +
                      item.unitOfMeasure
                    "
                    :value="item.rowId"
                  />
                </el-select>
                <el-input
                  v-else
                  v-model="row.batchCodeScanStr"
                  clearable
                  @change="handleBatchCodeScanChange($event, row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="扫码"
              align="center"
              prop="batchCodeScanStr"
              min-width="180"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-model="row.batchCodeScanStr"
                  clearable
                  placeholder="点击开始扫码"
                  @change="handleBatchCodeScanChange($event, row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <p
          style="margin-right: 480px; color: rgb(248, 11, 11); font-size: small"
        >
          注：领料列表无内容时，1.确认库存余量是否充足；2.确认BOM配置是否正确。
        </p>
        <div>
          <el-button @click="dialogVisible = false"> 取 消 </el-button>
          <el-button type="primary" @click="submitForm"> 确 定 </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  position: relative;
}
.dialog-footer .scan {
  position: absolute;
  left: 35px;
}
.quantity-issued-input.el-input-number .el-input__inner {
  text-align: right !important;
}
</style>
