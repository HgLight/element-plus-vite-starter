<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import queryString from 'qs';
import { ElMessage } from 'element-plus';

import Mingxi from './components/Mingxi.vue';
import { getSignalr } from '~/utils/signalR';
import ScanDialog from './components/ScanDialog.vue';
import { useAppStoreHook } from '../store/modules/app';

defineOptions({
  name: 'HomePage',
});

const signalr = getSignalr();
const { loadWorkOrder } = useAppStoreHook();
const { workOrderCode, erweimaData, workTaskFeedbacks, currentWorkTask } =
  storeToRefs(useAppStoreHook());

const scanDialogRef = ref();
const requesting = ref(false);
const dialogVisible = ref(false);
const QRcodeVal = ref<string>('');
const scanDialogVisible = ref(false);

if (import.meta.env.MODE == 'development') {
  QRcodeVal.value = 'MY240318001';
}

function handleSure() {
  workOrderCode.value = QRcodeVal.value;
  if (workOrderCode.value) {
    submit();
  }
}
function submit() {
  requesting.value = true;
  loadWorkOrder()
    .then(() => {
      if (
        erweimaData.value !== null &&
        erweimaData.value.workOrderStatus === 2
      ) {
        dialogVisible.value = true;
      }
    })
    .catch(() => {})
    .finally(() => {
      if (
        erweimaData.value !== null &&
        (erweimaData.value.workOrderStatus === 3 ||
          erweimaData.value.workOrderStatus === 1)
      ) {
        ElMessage.warning(
          erweimaData.value.workOrderStatus === 3
            ? '该工单已关闭'
            : '该工单还未提交'
        );
      } else {
        if(erweimaData.value != null &&
        JSON.stringify(erweimaData.value) === '{}'){
          scanDialogVisible.value = false;
        }
      }
      requesting.value = false;
    });
}
function startHome() {
  console.log('startHome');
  if (signalr.state !== 'Disconnected') return;
  signalr
    .start()
    .then(() => {
      console.log('signalR长连接服务启动成功。');
      registersConnectionHandler();
      removesHandler();
      registersHubMethodHandler();
    })
    .catch(() => {
      console.log('signalR长连接服务启动失败');
    });
}
/**
 * 注册连接Handler
 */
function registersConnectionHandler() {
  signalr.onreconnecting(() => {
    console.log('signalR长连接服务重新启中...');
  });
  signalr.onreconnected(() => {
    console.log('signalR长连接服务重新启成功。');
    removesHandler();
    registersHubMethodHandler();
  });
  signalr.onclose(() => {
    console.log('signalR长连接服务已关闭。');
  });
}
/**
 * 注册轮毂方法Handler
 */
function registersHubMethodHandler() {
  signalr.on('RefreashGongYi', refreashUnReadMsgHandler);
}
/**
 * 移除Handler
 */
function removesHandler() {
  signalr.off('RefreashGongYi', refreashUnReadMsgHandler);
}
/**
 *刷新未读信息Handler
 * @param data
 */
function refreashUnReadMsgHandler(data: any) {
  console.log('未读信息', JSON.stringify(data));
  console.log('erweimaData.', erweimaData.value.workOrderCode);
  if (QRcodeVal.value === data) {
    console.log(
      'QRcodeVal.value == data.workOrderCode',
      QRcodeVal.value === data
    );
    submit();
  }
}

onMounted(() => {
  startHome();
  if (workOrderCode.value) {
    submit();
  } else {
    scanDialogVisible.value = true;
  }
});

const str = location.search.split('?');
if (str.length > 0) {
  const search = queryString.parse(str[1]) as unknown as any;
  workOrderCode.value = search.workOrderCode;
  QRcodeVal.value = workOrderCode.value ? workOrderCode.value : '';
  console.log('QRcodeVal', QRcodeVal.value);
}
</script>

<template>
  <div class="home">
    <Mingxi
      v-if="dialogVisible && workTaskFeedbacks && currentWorkTask"
      @submit="submit"
    />
    <ScanDialog ref="scanDialogRef" v-model="QRcodeVal" v-model:requesting="requesting" v-model:dialogVisible="scanDialogVisible" @sure="handleSure" />
  </div>
</template>
