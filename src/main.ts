import App from './App.vue';
import router from './router';
import { setupStore } from './store';
import { getPlatformConfig } from './config';
import { createApp ,type Directive } from 'vue';

// import "~/styles/element/index.scss";

// import ElementPlus from "element-plus";
// import all element css, uncommented next line
// import "element-plus/dist/index.css";

// or use cdn, uncomment cdn link in `index.html`

import '~/styles/index.scss';
import 'uno.css';

// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss';



const app = createApp(App);

// 自定义指令
import * as directives from "~/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

getPlatformConfig(app).then(async config => {
  // app.use(ElementPlus);
  setupStore(app);
  app.use(router);
  await router.isReady();
  app.config.errorHandler = err => {
    /* 处理错误 */
    console.log('应用级别错误信息', err);
  };
  app.mount('#app');
});
