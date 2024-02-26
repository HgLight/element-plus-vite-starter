

<script setup lang='ts'>
import { ref ,watch} from "vue";
import { storeToRefs } from "pinia";
import { ElMessageBox,ElMessage } from "element-plus";

import {
  exportExcel,
  startWorkTask,
  finishWorkTask,
  saveWorkFeedback,
  deleteWorkFeedbackDefect,
  getWorkFeedbackDefectListByTaskId,
} from '~/api'
import ReCol24 from './ReCol24.vue'
import WorkTaskForm from './WorkTaskForm.vue'
import DefectFormDialog from './DefectFormDialog.vue'
import CheckReportTable from './CheckReportTable.vue'
import {  useAppStoreHook} from "../../store/modules/app";
import WorkOrderDescriptionsCard from './WorkOrderDescriptionsCard.vue'

const emits=defineEmits(['submit','done'])

let ws:any = null
const {activeName,bomTableData,erweimaData,workTaskFeedbacks,currentWorkTask,previousTask}=storeToRefs(useAppStoreHook())

const defectList=ref([]) 
const  quantityNum=ref(0)
const exporting=ref(false)
const  now=ref(Date.now())// 用于触发刷新工检列表数据
const defectDialogRef=ref() 
const  isBeforehand=ref(false)

watch(erweimaData,(val)=>{
  console.log('watch erweimaData', val)
      if (currentWorkTask.value.checkStatus !== 1) {
        now.value = new Date().getTime()
      }
})
watch(currentWorkTask,(val)=>{
  console.log('watch currentWorkTask', val)
  activeName.value = val.taskCode
})


    /**
     * 获取报工缺陷列表
     * @param {*} taskId
     */
     function getWorkFeedbackDefectList (taskId: any) {
      getWorkFeedbackDefectListByTaskId({
        taskId
      }).then((res) => {
        defectList.value = res.data
      })
    }

    /**
     * 刷新数据
     */
     function refreshData () {
      emits('submit')
    }
    /**
     * 初始化WebSocket
     */
     function initSocket () {
      ws = new WebSocket('ws://127.0.0.1:6500')
      ws.onopen = function (e: any) {
        console.log('websocket连接成功', e)
      }
      ws.onmessage = function (e: any) {
        console.log('收到数据', e)
        refreshData()
        // console.log(e.data)
      }
      ws.onclose = (e: any) => {
        console.log('websocket已断开', e)
        setTimeout(() => {
          initSocket()
        }, 5000)
      }
      ws.onerror = function (e: any) {
        console.log('websocket发生错误', e)
      }
    }
    /**
     * Tab Pane 点击回调
     * @param {*} tab
     */
     function handleTabClick (pane: any, ev: Event) {
      const item = workTaskFeedbacks.value[pane.index]
      activeName.value = item.taskCode
      if (item.issueStatus === 2) {
        quantityNum.value = erweimaData.value.workOrderQuantity
      }
      if (item.isAddDefect === true) {
        getWorkFeedbackDefectList(item.taskId)
      }
      console.log('currentWorkTask', currentWorkTask.value)
    }
    /**
     * 先行回调
     */
     function handleBeforehand (val: boolean) {
      isBeforehand.value = val
      if (!isBeforehand.value) {
        refreshData()
      }
    }
    /**
     * 删除缺陷
     * @param {*} row
     */
     function handleDelete (row: { defectRecordId: any; }, workTask: { taskId: any; }) {
      ElMessageBox.confirm('确定删除此数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteWorkFeedbackDefect({ id: row.defectRecordId })
          .then(({ code, message }) => {
            if (code === 0) {
              ElMessage.success(message)
              getWorkFeedbackDefectList(workTask.taskId)
            }
          })
      })
    }
    /**
     * 添加缺陷事件
     * @param {*} workTask
     */
     function handleDefect (workTask: any) {
      defectDialogRef.value.show(workTask, erweimaData.value.productLineType)
    }
    /**
     * 开始任务事件
     * @param {*} workTask
     */
     function handleStart (workTask: { checkStatus: number; processId: any; processCode: any; processName: any; taskId: any; taskCode: any; taskName: any; status: number; }) {
      if (workTask.checkStatus !== 1) {
        // 工检
        console.log(bomTableData.value)
        const bomDetail = bomTableData.value.map((item) => {
          return item.materialName + ' '
        }).toString()
        const _erweimaData = JSON.parse(JSON.stringify(erweimaData.value))
        _erweimaData.bomDetail = bomDetail
        const { workTaskFeedbacks, ...msg } = _erweimaData
        msg.curProcessId = workTask.processId
        msg.curProcessCode = workTask.processCode
        msg.curProcessName = workTask.processName
        msg.curTaskId = workTask.taskId // 任务ID
        msg.curTaskCode = workTask.taskCode // 任务ID
        msg.curTaskName = workTask.taskName // 任务ID
        console.log(msg)
        ws.send(JSON.stringify(msg))
      }
      if (workTask.status !== 1) {
        return
      }
      startWorkTask({
        workOrderId: erweimaData.value.workOrderId,
        taskId: workTask.taskId
      })
        .then(({ code, message }) => {
          // if (erweimaData.value.isAntecede === true) {
          // } else {
          if (code === 0) {
            ElMessage.success(message)
            emits('submit')
          }

          // }
        })
        .catch((err) => {
          console.log(err)
        })
    }
    /**
     * 结束任务事件
     */
     function handleEnd (workTask: { checkStatus: number; quantityQualified: any; userId: any; taskId: any; quantityTask:number ,quantityProduced:number}) {
      if (workTask.checkStatus === 1 && !workTask.quantityQualified) {
        ElMessage.warning('请输入产出数量')
        return
      }
      if (workTask.checkStatus === 1 && !workTask.userId) {
        ElMessage.warning('请选择操作人')
        return
      }
      const bodyData = { ...workTask }
      bodyData.quantityProduced = bodyData.quantityTask
      modify(bodyData, true).then(() => {
        finishWorkTask({
          workOrderId: erweimaData.value.workOrderId,
          taskId: workTask.taskId,
          quantityProduced: bodyData.quantityProduced
        })
          .then(({ code, message }) => {
          // if (erweimaData.value.isAntecede === true) {
          // } else {
            if (code === 0) {
              ElMessage.success(message)
              emits('submit')
            }
          // }
          })
          .catch((err) => {
            console.log(err)
          })
      })
    }
    /**
     * 报工
     * @param {*} val
     */
     function modify (val: any, isFinish: any) {
      val.investmentNum = val.quantityTask
      // val.quantityFeedback = val.quantityFeedback
      return new Promise((resolve, reject) => {
        saveWorkFeedback({
          ...val,
          feedbackId: undefined, // 记录主键ID
          feedbackType: 1, // 报工类型 1-自行报工 2-统一报工
          feedbackTypeName: '自行报工', // 报工类型 1-自行报工 2-统一报工
          workstationId: val.workstationId ? val.workstationId : '00000000-0000-0000-0000-000000000000', // 工作站ID
          workstationCode: val.workstationCode, // 工作站编码
          workstationName: val.workstationName, // 工作站名称
          workshopId: val.workshopId, // 车间ID
          workshopCode: val.workshopCode, // 车间编码
          workshopName: val.workshopName, // 车间名称
          machineryId: erweimaData.value.machineryId, // 设备ID
          machineryCode: erweimaData.value.machineryCode, // 设备编码
          machineryName: erweimaData.value.machineryName, // 设备名称
          mouldId: val.mouldId, // 模具ID
          mouldCode: val.mouldCode, // 模具编码
          mouldName: val.mouldName, // 模具名称
          workOrderId: erweimaData.value.workOrderId, // 生产工单ID
          workOrderCode: erweimaData.value.workOrderCode, // 生产工单编码
          workOrderName: erweimaData.value.workOrderName, // 生产工单名称
          taskId: val.taskId, // 生产任务ID
          taskCode: val.taskCode, // 生产任务编码
          taskName: val.taskName, // 生产任务名称
          productId: erweimaData.value.productId, // 产品ID
          productCode: erweimaData.value.productName, // 产品编码
          productName: erweimaData.value.productId, // productCode
          specification: erweimaData.value.specification, // 规格型号
          unitOfMeasure: '', // 计量单位
          quantityTask: val.quantityTask, // 排产数量/投入数量
          quantityFeedback: val.quantity, // 本次报工数量(合格数量+不合格数量)
          quantityQualified: val.quantityTask, // 合格数量/产出数量
          quantityUnqualified: val.quantityUnqualified, // 不合格数量，从子表自动计算
          userId: val.userId, // 报工人员ID
          userName: val.userName, // 报工人员账号
          staffName: val.staffName, // 报工人员姓名
          feedbackChannel: 1, // 报工途径 1-PAD 2-手机 3-电脑
          feedbackChannelName: 'PAD', // 报工途径 1-PAD 2-手机 3-电脑
          feedbackTime: undefined, // 报工时间
          recordUserId: undefined, // 录入人员Id
          recordUserName: '', // 录入人员账号
          recordStaffName: '', // 录入人员姓名
          status: val.status, // 状态 1-草稿 2-已提交
          remarks: '', // 备注
          unlockUserId: val.unlockUserId, // 解锁人ID
          unlockStaffName: val.unlockStaffName, // 解锁人姓名
          unlockReason: val.unlockReason // 解锁原因
        })
          .then(({ code }) => {
          // if (erweimaData.value.isAntecede === true) {
          // } else {
            if (code === 0) {
              if (!isFinish) {
                emits('done')
              }
              resolve(code)
            }
          // }
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      })
    }
    function handleExport () {
      exporting.value = true
      exportExcel('/api/CheckReportHeader/ExportAhead?', '首件检验记录', {
        workOrderCode: erweimaData.value.workOrderCode
      },"").finally(() => {
        exporting.value = false
      })
    }



  // 初始化WebSocket
  initSocket()

  activeName.value = currentWorkTask.value.taskCode
  console.log('currentWorkTask', currentWorkTask.value)

 

  if (currentWorkTask.value?.issueStatus === 2) {
    quantityNum.value = erweimaData.value.workOrderQuantity
  } else {
    quantityNum.value = 0
  }
  if (currentWorkTask.value?.isAddDefect === true) {
    getWorkFeedbackDefectList(currentWorkTask.value.taskId)
  }

</script>

<template>
  <div>
    <WorkOrderDescriptionsCard @beforehand="handleBeforehand" />
    <el-tabs
      v-if="erweimaData&&workTaskFeedbacks.length>0"
      v-model="activeName"
      style="margin-top:20px"
      type="border-card"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="workTask in workTaskFeedbacks"
        :key="workTask.taskId"
        stretch
        :label="workTask.processName + '---'+ workTask.statusName + '---' + workTask.workshopName"
        :data="workTask"
        :name="workTask.taskCode"
      >
        <div v-if="currentWorkTask.taskName === workTask.taskName">
          <div v-if="workTask.checkStatus !==1">
            <el-row :gutter="40">
              <ReCol24
                style="margin-bottom: 22px;"
              >
                <el-button
                  :disabled="!workTask.canStart"
                  :title="erweimaData.taskStatus==3||erweimaData.taskStatus==4?'工单已暂停或已结束':previousTask&&previousTask.status!=4?'上一个工序未结束，不可开始。':workTask.status ===4?'已结束，不可开始。':''"
                  size="small"
                  type="success"
                  @click="handleStart(workTask)"
                >
                  开始
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :disabled="!workTask.canFinish"
                  :title="erweimaData.taskStatus==3||erweimaData.taskStatus==4?'工单已暂停或已结束':workTask.status===1?'未开始，不可结束。': workTask.status===4?'已结束。':''"
                  @click="handleEnd(workTask)"
                >
                  结束
                </el-button>
                <el-button
                  v-if="erweimaData.isAntecede&&workTask.processName.indexOf('先行') !=-1"
                  size="small"
                  type="primary"
                  :loading="exporting"
                  :disabled="workTask.status!=4"
                  :title="workTask.status!=4?'未结束，无法导出“首件检验记录”': '导出首件检验记录'"
                  @click="handleExport()"
                >
                  导出
                </el-button>
              </ReCol24>
              <ReCol24>
                <CheckReportTable
                  :key="now"
                  :current-task="workTask"
                />
              </ReCol24>
            </el-row>
          </div>
          <div v-else>
            <div
              :key="currentWorkTask.id"
            >
              <WorkTaskForm
                :key="workTask.taskId"
                :default-quantity-num="quantityNum"
                :work-task="workTask"
                @done="refreshData"
              />
              <el-collapse v-if="workTask.isAddDefect === true">
                <el-collapse-item
                  name="1"
                >
                  <template #title>
                    <div class="collapse-item-title">
                      {{ workTask.status==2?'添加不良品':'不良品' }}
                      <el-button
                        v-if="workTask.status==2||workTask.status==3"
                        type="primary"
                        size="small"
                        style="margin-left: 20px"
                        :disabled="erweimaData.taskStatus==3||erweimaData.taskStatus==4||workTask.status==1||workTask.status==4"
                        :title="erweimaData.taskStatus==3||erweimaData.taskStatus==4?'工单已暂停或已结束':workTask.status==1?'未开始，不可添加':workTask.status==4?'已结束，不可开始':''"
                        @click.stop="handleDefect(workTask)"
                      >
                        添加
                      </el-button>
                    </div>
                  </template>
                  <el-table
                    :data="defectList"
                    style="width: 100%"
                    height="260"
                    border
                    size="small"
                  >
                    <el-table-column
                      label="序号"
                      type="index"
                      width="60"
                      align="center"
                    />
                    <el-table-column
                      prop="defectCode"
                      label="缺陷编码"
                      align="center"
                    />
                    <el-table-column
                      prop="defectName"
                      label="缺陷名称"
                      align="center"
                    />
                    <el-table-column
                      prop="quantityUnqualified"
                      label="数量"
                      align="center"
                    />
                    <el-table-column
                      prop="remarks"
                      label="备注"
                      align="center"
                    />
                    <el-table-column
                      v-if="workTask.taskStatus==2"
                      align="center"
                    >
                      <template
                        #header
                      >
                        <label>操作</label>
                        <!-- <el-button
                          type="primary"
                          size="small"
                          style="margin-left: 20px"
                          :disabled="workTask.status==1||workTask.status==4"
                          :title="workTask.status==1?'未开始，不可添加':workTask.status==4?'已结束，不可开始':''"
                          @click="handleDefect(workTask)"
                        >
                          添加
                        </el-button> -->
                      </template>
                      <template #defalut="{row}">
                        <el-button
                          size="small"
                          type="danger"
                          @click="handleDelete(row,workTask)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-empty
      v-else
      description="暂无生产任务数据"
    />
    <DefectFormDialog
      ref="defectDialogRef"
      @done="getWorkFeedbackDefectList"
    />
  </div>
</template>

<style scoped>
.el-input-group .el-input__suffix{
  line-height: 40px!important;
}
.collapse-item-title{
  width: 100%;
  padding-right: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
~/api