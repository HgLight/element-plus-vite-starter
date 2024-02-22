import type { App } from "vue";
import { createPinia } from "pinia";
/**
 * 一个 Store （如 Pinia）是一个实体，它持有未绑定到您的组件树的状态和业务逻辑。
 * 换句话说，它托管全局状态。
 * 它有点像一个始终存在并且每个人都可以读取和写入的组件。
 * 它有三个概念，state、getters 和 actions 并且可以安全地假设这些概念等同于组件中的“数据”、“计算”和“方法”。
 */
const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
