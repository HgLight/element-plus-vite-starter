<template>
  <el-config-provider namespace="ep" :locale="currentLocale">
    <BaseHeader :now="now" />
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
import { defineComponent } from 'vue';
import { checkVersion } from 'version-rocket';
import { ElNotification } from 'element-plus';
import en from 'element-plus/dist/locale/en.mjs';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

import { getTime } from '~/api';
import versionRecord from './publish.json';

export default defineComponent({
  name: 'App',
  data() {
    return {
      now: '',
      language: 'zh-cn',
    };
  },
  computed: {
    currentLocale() {
      return this.language === 'zh-cn' ? zhCn : en;
    },
  },
  beforeCreate() {
    const { version } = __APP_INFO__.pkg;
    const { VITE_PUBLIC_PATH, MODE } = import.meta.env;
    // https://github.com/guMcrey/version-rocket/blob/main/README.zh-CN.md#api
    if (MODE !== 'development') {
      // 版本实时更新检测，用于非开发环境
      const publish = versionRecord.find(item => item.version == version);
      const polling = 10;
      checkVersion(
        // config
        {
          // 轮询监测的时间间隔, 单位 ms 5秒检测一次版本
          pollingTime: publish ? publish.pollingTime : polling * 1000,
          localPackageVersion: version,
          originVersionFileUrl: `${location.origin}${VITE_PUBLIC_PATH}version.json`,
          onVersionUpdate: data => {
            console.log('onVersionUpdate1', data);
            setTimeout(
              () => {
                window.location.reload();
              },
              (polling / 2) * 1000
            );
            ElNotification({
              title: '新版本提示',
              message: '检测到新版本，系统将会在5秒后为您自动更新。',
              type: 'success',
              duration: (polling / 2) * 1000,
            });
          },
          onRefresh: data => {
            console.log('onRefresh', data);
          },
          onCancel: data => {
            console.log('onCancel', data);
          },
        },
        // options
        {
          title: publish ? publish.title : '检测到新版本',
          description: publish
            ? publish.description
                .map(item => item.index + '.' + item.value)
                .join()
            : '',
          primaryColor: publish ? publish.primaryColor : '#758bfd',
          rocketColor: publish ? publish.rocketColor : '#ff8600',
          imageUrl: publish ? publish.imageUrl : undefined,
          buttonText: publish ? publish.buttonText : '立即更新',
        }
      );
    }
  },
  mounted() {
    this.getServeTime();
  },
  methods: {
    // 获取服务器时间
    async getServeTime() {
      const res = await getTime({});
      this.now = res;
    },
  },
});
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
