<script lang="ts" setup>
import { storeToRefs } from "pinia";

import { toggleDark } from "~/composables";
import { useAppStoreHook } from "~/store/modules/app";

const { workOrderCode } =
  storeToRefs(useAppStoreHook());
</script>

<template>
  <div class="flex">
    <span class="work-order-code h-[59px] flex items-center pl-5">生成工艺流转（{{ workOrderCode }}）</span>
    <el-menu class="el-menu-demo flex-1" mode="horizontal">
      <!-- <el-menu-item index="1">Element Plus</el-menu-item>
      <el-sub-menu index="2">
        <template #title>Workspace</template>
        <el-menu-item index="2-1">item one</el-menu-item>
        <el-menu-item index="2-2">item two</el-menu-item>
        <el-menu-item index="2-3">item three</el-menu-item>
        <el-sub-menu index="2-4">
          <template #title>item four</template>
          <el-menu-item index="2-4-1">item one</el-menu-item>
          <el-menu-item index="2-4-2">item two</el-menu-item>
          <el-menu-item index="2-4-3">item three</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
      <el-menu-item index="3" disabled>Info</el-menu-item>
      <el-menu-item index="4">Orders</el-menu-item> -->
      <el-menu-item h="full" @click="toggleDark()">
        <button
          class="border-none w-full bg-transparent cursor-pointer"
          style="height: var(--ep-menu-item-height)"
        >
          <i inline-flex i="dark:ep-moon ep-sunny" />
        </button>
      </el-menu-item>
    </el-menu>
  </div>

</template>
<style lang="scss" scoped>
.work-order-code{
  border-bottom: solid 1px var(--ep-menu-border-color);
}
.el-menu-demo {
  display: flex;
  justify-content: flex-end;
}
</style>
