<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, watch } from 'vue';
import { getCheckReportPages } from '~/api';

import { useAppStoreHook } from '~/store/modules/app';

const props = defineProps({
  currentTask: {
    type: Object,
    required: true,
  },
});

const { erweimaData } = storeToRefs(useAppStoreHook());

const position = ref(0);
const tableData = ref<any>([]);
const spanArray = ref<Array<number>>([]);

watch(tableData, val => {
  if (val.length < 1) {
    spanArray.value = [];
    return;
  }
  if (val.length === 1) {
    spanArray.value = [1];
    return;
  }
  const _spanArray: Array<number> = [];
  val.forEach((_item: any, index: number) => {
    if (index === 0) {
      _spanArray.push(1);
      position.value = 0;
    } else {
      if (val[index].checkTime === val[index - 1].checkTime) {
        _spanArray[position.value] += 1;
        _spanArray.push(0);
      } else {
        _spanArray.push(1);
        position.value = index;
      }
    }
  });
  spanArray.value = _spanArray;
});

function getData() {
  getCheckReportPages({
    pageIndex: 1,
    pageSize: 20,
    workOrderCode: erweimaData.value.workOrderCode,
    productId: erweimaData.value.productId,
    processId: props.currentTask.processId,
  }).then(res => {
    const _data = res.data.data || [];
    console.log(_data);
    const _tableData = _data.map((item: { [x: string]: any; rows: any }) => {
      const rows = item.rows;
      rows.forEach(
        (
          element: {
            checkName: any;
            resultValueStr: string;
            hasValue: any;
            resultValue: number;
            thresholdMax: number;
            thresholdMin: number;
          },
          index: string
        ) => {
          item['checkName' + index] = element.checkName;
          item['resultValueStr' + index] = element.resultValueStr;
          item['isRed' + index] =
            element.resultValueStr !== 'OK' &&
            element.hasValue &&
            (element.resultValue > element.thresholdMax ||
              element.resultValue < element.thresholdMin);
        }
      );
      return item;
    });
    tableData.value = _tableData;
  });
}

function objectSpanMethod(params: any) {
  // 表格合并行
  if (
    params.columnIndex === 0 ||
    params.columnIndex === 1 ||
    params.columnIndex === 2 ||
    params.columnIndex === 3
  ) {
    const _row = spanArray.value[params.rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col,
    };
  }
}

onMounted(() => {
  getData();
});
</script>

<template>
  <el-table
    :data="tableData"
    border
    :span-method="objectSpanMethod"
    style="width: 100%"
  >
    <el-table-column v-if="false" type="selection" width="55" align="center" />
    <el-table-column
      v-if="false"
      prop="batchCode"
      label="批次号"
      align="center"
    />
    <el-table-column
      v-if="false"
      prop="productCode"
      label="产品编码"
      align="center"
    />
    <el-table-column
      prop="machineryCode"
      label="机器编码"
      align="center"
      min-width="100"
    />
    <el-table-column
      v-if="false"
      prop="materialNo"
      label="物料号"
      align="center"
    />
    <!-- <el-table-column
                    v-if="isIndex"
                    label="时间"
                  >
                    <template slot-scope="scope">
                      <span>{{ scope.row.createTime }}</span>
                    </template>
                  </el-table-column> -->
    <el-table-column
      prop="mouldCode"
      label="模具编码"
      align="center"
      min-width="100"
    />
    <el-table-column
      v-if="true"
      prop="operator"
      label="操作员"
      align="center"
    />
    <el-table-column
      label="检测时间"
      align="center"
      prop="checkTime"
      min-width="164"
    />
    <template v-if="tableData && tableData.length > 0">
      <el-table-column
        v-for="(col, index) in tableData[0]?.rows"
        :key="index"
        :label="col.checkName"
        align="center"
        :min-width="100"
      >
        <template #default="{ row }">
          <span :style="{ color: row['isRed' + index] ? 'red' : '' }">
            {{ row['resultValueStr' + index] }}
          </span>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>
~/api
