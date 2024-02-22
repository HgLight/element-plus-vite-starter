import {createRouter,Router} from 'vue-router'

import Home from '../views/Home.vue'
import {getHistoryMode} from "./utils";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router:Router = createRouter({
    history: getHistoryMode(),
    routes,
    strict: true,
    scrollBehavior(to, from, savedPosition) {
        return new Promise(resolve => {
          if (savedPosition) {
            return savedPosition;
          } else {
            if (from.meta.saveSrollTop) {
              const top: number =
                document.documentElement.scrollTop || document.body.scrollTop;
              resolve({ left: 0, top });
            }
          }
        });
      }
})

export default router
