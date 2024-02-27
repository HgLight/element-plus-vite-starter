<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStoreHook } from "../store/modules/app";

defineOptions({
  name: "HomePage",
});

const { homeName, homeEName } = storeToRefs(useAppStoreHook());
</script>

<template>
  <div>中文名：{{ homeName }}</div>
  <div>英文名：{{ homeEName }}</div>
</template>
