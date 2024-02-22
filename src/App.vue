<template>
  <el-config-provider namespace="ep">
    <BaseHeader :now="now"/>
    <div class="flex main-container">
      <!-- <BaseSide /> -->
      <div w="full" py="4">
        <!-- <Logos my="4" /> -->
        <!-- <HelloWorld msg="Hello Vue 3 + Element Plus + Vite" /> -->
        <router-view />
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getTime } from "./api/home";

export default defineComponent({
  name: "App",
  data() {
    return {
      now: "",
    };
  },
  mounted(){
    this.getServeTime();
  },
  methods:{
     // 获取服务器时间
     async getServeTime() {
      const res = await getTime({});
      this.now = res;
    },
  }
})
</script>
<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}
</style>
