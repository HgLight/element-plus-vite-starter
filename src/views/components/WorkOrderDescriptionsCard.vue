<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStoreHook } from "~/store/modules/app";

const emits = defineEmits(["beforehand"]);

const { bomTableData, erweimaData } = storeToRefs(useAppStoreHook());

const isBeforehand = ref<boolean>(false);

function handleBeforehand() {
  isBeforehand.value = !isBeforehand.value;
  emits("beforehand", isBeforehand.value);
}
</script>

<template>
  <el-card shadow="always">
    <el-descriptions class="margin-top" title="工单生产" :column="3" border>
      <!-- <template #extra>
        <template v-if="erweimaData.isAntecede === true">
          <el-button
            type="primary"
            @click="handleBeforehand"
          >
            {{ isBeforehand===false?'先行':'返回' }}
          </el-button>
        </template>
      </template> -->
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
        <el-tag v-if="erweimaData.curProcessName" size="small">
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
          Bom明细数据
        </template>
        <el-popover placement="bottom" width="440" trigger="click">
          <el-table :data="bomTableData" border size="small">
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
            <el-button type="primary" size="small"> 查看明细 </el-button>
          </template>
        </el-popover>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
