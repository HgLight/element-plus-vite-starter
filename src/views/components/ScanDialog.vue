<script setup lang="ts">
import { ref } from 'vue';

const requesting = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const QRcodeVal = ref<string>(''); // HL23070303 SC23063003 MY23070401 MY23070403 MY23070404 MY23070601 SC23071106 MY240221008

defineOptions({
  name: 'ScanDialog',
});
const emits = defineEmits(['complete']);

function show() {
  dialogVisible.value = true;
}

function close(code: number, _QRcodeVal: string) {
  console.log('code', code);
  requesting.value = false;
  if (code !== 0) {
    dialogVisible.value = false;
  } else {
    dialogVisible.value = true;
    QRcodeVal.value = _QRcodeVal;
  }
}
defineExpose({ show, close });

function handleChange() {
  if (!QRcodeVal.value) {
    return;
  }
  if (!requesting.value) {
    emits('complete', QRcodeVal.value);
  }
  requesting.value = true;
}

if (import.meta.env.MODE == 'development') {
  QRcodeVal.value = 'MY240318001';
}
</script>

<template>
  <el-dialog
    title=""
    v-model="dialogVisible"
    width="100%"
    fullscreen
    :show-close="false"
  >
    <div>
      <div class="content">
        <h3>二维码扫描</h3>
        <el-input v-model.trim="QRcodeVal" clearable @change="handleChange">
          <template #append>
            <el-button
              v-optimize="{
                event: 'click',
                fn: handleChange,
                immediate: true,
                timeout: 1000,
              }"
              type="primary"
              :disabled="!QRcodeVal"
              :loading="requesting"
            >
              确认
            </el-button>
          </template>
        </el-input>

        <div class="text">
          说明:<br />
          1.输入框获得鼠标焦点,点击扫码艳进行扫描二维码<br />
          2.如果输入框中取到二维码内未进行任何操作,请点击诊认按田<br />
          3.扫提二维码之前,如果输入框中有内容,请先清空<br />
          4.以上问题如果都做了还无法操作,请刷新页面或从系统中集新打开页面进行操作<br />
          注:输入框每隔5秒会自动清空输入框并获取焦点
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style>
.content {
  width: 50%;
  margin: 10vw auto;
}
.content .el-button {
  width: 100%;
  margin-top: 20px;
}
.el-dialog__header {
  /* background-color: #f0f2f5; */
}
.is-fullscreen .el-dialog__body {
  /* background-color: #f0f2f5; */
  height: calc(100vh - 90px);
}
.text {
  margin-top: 20px;
  text-align: left;
}
</style>
