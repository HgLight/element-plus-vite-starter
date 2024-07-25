<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { getIssueRowListByWorkOrderId } from "~/api"
import { useAppStoreHook } from '~/store/modules/app';

const emits = defineEmits(['beforehand']);

const { bomTableData, erweimaData } = storeToRefs(useAppStoreHook());

const pickingTableData=ref([])
const isBeforehand = ref<boolean>(false);

watch(erweimaData,()=>{
  onSearch();
})

function handleBeforehand() {
  isBeforehand.value = !isBeforehand.value;
  emits('beforehand', isBeforehand.value);
}

// 获取表格数据
function onSearch() {
  getIssueRowListByWorkOrderId({
    workOrderId: erweimaData.value.workOrderId,
  })
    .then(({ data }) => {
      const list = data || [];
      pickingTableData.value = list.map((item :any) => {
        item.buttonDisabled = {};
        item.buttonTitle = {};
        return item;
      });
    })
    .catch(() => {
      pickingTableData.value = [];
    })
    .finally(() => {
    });
}

onMounted(()=>{
  onSearch()
})
</script>

<template>
  <el-card shadow="never">
    <el-descriptions title="工单生产" :column="3" border>
      <template v-if="false" #extra>
        <template v-if="erweimaData.isAntecede === true">
          <el-button
            type="primary"
            @click="handleBeforehand"
          >
            {{ isBeforehand===false?'先行':'返回' }}
          </el-button>
        </template>
      </template>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-edit" />
          产品编码
        </template>
        {{ erweimaData.productCode }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-paperclip" />
          工单编码
        </template>
        {{ erweimaData.workOrderCode }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-sort" />
          尺寸
        </template>
        {{ erweimaData.specification }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-medal" />
          当前工序
        </template>
        <el-tag v-if="erweimaData.curProcessName">
          {{ erweimaData.curProcessName }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-medal" />
          工单数量
        </template>
        {{ erweimaData.workOrderQuantity }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <i inline-flex i="ep-chat-line-square" />
          明细数据
        </template>
        <el-popover placement="bottom-end" width="540" trigger="click">
          <el-table :data="bomTableData" border>
            <el-table-column
              property="materialCode"
              label="物料编码"
              align="center"
            />
            <el-table-column
              property="materialName"
              label="物料名称"
              align="center"
            />
            <el-table-column
              property="specification"
              label="规格"
              align="center"
            />
          </el-table>
          <template #reference>
            <el-button type="primary" size="small"> Bom明细数据 </el-button>
          </template>
        </el-popover>
        <el-popover placement="bottom-end" width="740" :disabled="pickingTableData.length<1" trigger="click" p>
          <el-table :data="pickingTableData" border :max-height="200">
            <el-table-column
              property="materialCode"
              label="物料编码"
              min-width="120"
              :show-overflow-tooltip="true"
              align="center"
            />
            <el-table-column
              property="materialName"
              label="物料名称"
              min-width="120"
              :show-overflow-tooltip="true"
              align="center"
            />
            <el-table-column
              property="specification"
              label="规格"
              min-width="120"
              :show-overflow-tooltip="true"
              align="center"
            />
            <el-table-column
              property="unitOfMeasure"
              label="计量单位"
              width="90"
              align="center"
            />
            <el-table-column
              property="quantityIssued"
              label="领料数量"
              width="90"
              align="center"
            />
            <el-table-column
              property="batchCode"
              label="批次编号"
              min-width="120"
              :show-overflow-tooltip="true"
              align="center"
            />
          </el-table>
          <template #reference>
            <el-button type="primary" :disabled="pickingTableData.length<1" size="small"> 领料明细数据 </el-button>
          </template>
        </el-popover>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
