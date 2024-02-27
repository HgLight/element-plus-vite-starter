import { store } from "../index";
import { appType } from "./types";
import { defineStore } from "pinia";

export const useAppStore = defineStore({
  id: "pure-app",
  state: (): appType => ({
    homeName: "首页",
  }),
  getters: {
    homeEName(state): string {
      return "Home Page";
    },
  },
  actions: {
    changeName(newName: string) {
      this.homeName = newName;
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}
