<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useFullscreen, useNow, useDateFormat } from '@vueuse/core';

import { toggleDark } from '~/composables';
import { useAppStoreHook } from '~/store/modules/app';

const { version } = __APP_INFO__.pkg;

const formattedNow = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss');
const { toggle, isFullscreen } = useFullscreen();
const { workOrderCode } = storeToRefs(useAppStoreHook());
</script>

<template>
  <div class="flex">
    <span class="h-[59px] flex items-center pl-5"
      >生产工艺流转<span>V{{ version }}</span>（{{ workOrderCode }}）</span
    >
    <div class="flex-1">
      <el-menu v-if="false" class="el-menu-demo flex-1" mode="horizontal">
        <el-menu-item index="1">Element Plus</el-menu-item>
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
        <el-menu-item index="4">Orders</el-menu-item>
      </el-menu>
    </div>
    <div style="height: var(--ep-menu-item-height)" class="flex items-center">
      <span class="mr-5 text-[18px]">{{ formattedNow }}</span>
      <i
        v-if="true"
        inline-flex
        :i="isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'"
        class="mr-3 cursor-pointer"
        @click="toggle()"
      ></i>
      <i
        v-if="true"
        inline-flex
        i="dark:ep-moon ep-sunny"
        class="mr-3 cursor-pointer"
        @click="toggleDark()"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.work-order-code {
  border-bottom: solid 1px var(--ep-menu-border-color);
}
.el-menu-demo {
  display: flex;
  justify-content: flex-end;
}
</style>
