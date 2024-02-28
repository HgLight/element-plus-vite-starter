import { store } from '../index';
import { appType } from './types';
import { defineStore } from 'pinia';
import { getFlowCard, getWorkOrderBomList } from '../../api';


export const useAppStore = defineStore({
  id: 'pure-app',
  state: (): appType => ({
    homeName: "首页",
    oldWorkTask: null,
    workOrderCode: "",
    activeName: "",
    erweimaData: {},
    bomTableData: [],
  }),
  getters: {
    homeEName(state): string {
      return 'Home Page';
    },

    workTaskFeedbacks(state): Array<any> {
      const _workTaskFeedbacks = JSON.parse(
        JSON.stringify(
          state.erweimaData.workTaskFeedbacks
            ? state.erweimaData.workTaskFeedbacks
            : []
        )
      );
      console.log("workTaskFeedbacks");
      return _workTaskFeedbacks.map((item: any) => {
        item.startTime =
          item.startTime === "1900-01-01 00:00:00" ||
          item.startTime === "0001-01-01 00:00:00"
            ? ""
            : item.startTime;
        item.endTime =
          item.endTime === "1900-01-01 00:00:00" ||
          item.endTime === "0001-01-01 00:00:00"
            ? ""
            : item.endTime;
        item.feedbackTime =
          item.feedbackTime === "1900-01-01 00:00:00" ||
          item.feedbackTime === "0001-01-01 00:00:00"
            ? ""
            : item.feedbackTime;
        item.userId =
          item.userId === "00000000-0000-0000-0000-000000000000"
            ? ""
            : item.userId;
        item.mouldId =
          item.mouldId === "00000000-0000-0000-0000-000000000000"
            ? ""
            : item.mouldId;
        item.machineryId =
          item.machineryId === "00000000-0000-0000-0000-000000000000"
            ? ""
            : item.machineryId;
        item.workstationId =
          item.workstationId === "00000000-0000-0000-0000-000000000000"
            ? ""
            : item.workstationId;
        return item;
      });
    },
    // 进行中的工作任务
    afootWorkTask(state): any {
      console.log("afootWorkTask");
      return this.workTaskFeedbacks.find((item: any) => item.status === 2);
    },
    // 未开始的工作任务
    waitingWorkTask(state): any {
      console.log("waitingWorkTask");
      return this.workTaskFeedbacks.find((item: any) => item.status === 1);
    },
    // 最后一个工作任务
    lastWorkTask(state): any {
      console.log("lastWorkTask");
      return this.workTaskFeedbacks[this.workTaskFeedbacks.length - 1];
    },
    // 当前需要执行的工作任务
    currentWorkTask(state): any {
      console.log("currentWorkTask");
      if (state.activeName === "") {
        const tempCurrentWorkTask =
          this.afootWorkTask !== undefined
            ? this.afootWorkTask
            : this.waitingWorkTask !== undefined
              ? this.waitingWorkTask
              : this.lastWorkTask;
        const tempCurrentWorkTaskIndex = this.workTaskFeedbacks.findIndex(
          (item: any) => item.taskCode === tempCurrentWorkTask.taskCode
        );
        if (
          state.oldWorkTask &&
          tempCurrentWorkTask.taskCode !== state.oldWorkTask.taskCode
        ) {
          const oldWorkTaskIndex = this.workTaskFeedbacks.findIndex(
            item => item.taskCode === state.oldWorkTask.taskCode
          );
          if (tempCurrentWorkTaskIndex < oldWorkTaskIndex) {
            const newWorkTask = this.workTaskFeedbacks.find(
              item => item.taskCode === state.oldWorkTask.taskCode
            );
            if (newWorkTask.taskStatus === 4) {
              return oldWorkTaskIndex !== this.workTaskFeedbacks.length - 1
                ? this.workTaskFeedbacks[oldWorkTaskIndex + 1]
                : newWorkTask;
            } else {
              return newWorkTask;
            }
          } else {
            return tempCurrentWorkTask;
          }
        } else {
          return tempCurrentWorkTask;
        }
      } else {
        return this.workTaskFeedbacks.find(
          (item: any) => item.taskCode === state.activeName
        );
      }
    },
    // 当前需要执行的工作任务的前一道工序
    previousTask(state): any {
      console.log("previousTask");
      const currentTaskIndex = this.workTaskFeedbacks.findIndex(
        i => i.taskId === this.currentWorkTask.taskId
      );
      return currentTaskIndex > 0
        ? this.workTaskFeedbacks[currentTaskIndex - 1]
        : null;
    },
  },
  actions: {
    changeName(newName: string) {
      this.homeName = newName;
    },
    loadWorkOrder() {
      console.log(this.oldWorkTask);
      console.log(this.currentWorkTask);
      this.oldWorkTask = this.currentWorkTask
        ? JSON.parse(JSON.stringify(this.currentWorkTask))
        : null;
      console.log(this.oldWorkTask);
      return new Promise((resolve, reject) => {
        getFlowCard({
          workOrderCode: this.workOrderCode,
        })
          .then(({ data }) => {
            const _erweimaData = data;
            this.activeName = "";
            this.erweimaData = _erweimaData;
            this.loadBom(_erweimaData.workOrderId);
            resolve(_erweimaData);
          })
          .catch(() => {
            this.erweimaData = null;
            this.bomTableData = [];
          });
      });
    },
    loadBom(workOrderId: string) {
      return new Promise((resolve, reject) => {
        getWorkOrderBomList({
          workOrderId,
        })
          .then(({ data }) => {
            const _bomTableData = data || [];
            this.bomTableData = _bomTableData;
            resolve(data);
          })
          .catch(() => {
            this.bomTableData = [];
          });
      });
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}
