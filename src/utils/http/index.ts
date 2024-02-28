import Axios, {
  AxiosInstance,
  AxiosRequestConfig,
  CustomParamsSerializer,
} from 'axios';
import { ElMessage } from 'element-plus';

import {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig,
} from './types.d';
import { stringify } from 'qs';
import router from '../../router';
import NProgress from '../progress';
import { getConfig } from '../../config';
// import { getToken, formatToken } from "@/utils/auth";
// import { useUserStoreHook } from "@/store/modules/user";

// 操作正常Code数组
const codeVerificationArray = [200, 0, '200', '0'];
// 状态信息的字段名称
const messageName = 'msg';
//状态信息
const CODE_MESSAGE = {
  200: '服务器成功返回请求数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队(异步任务)',
  204: '删除数据成功',
  400: '发出信息有误',
  401: '登录状态已过期，请重新登录。',
  402: '令牌过期',
  403: '用户得到授权，但是访问是被禁止的',
  404: '访问资源不存在',
  406: '请求格式不可得',
  410: '请求资源被永久删除，且不会被看到',
  500: '服务器发生错误',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 当前使用mock模拟请求，将baseURL制空，如果你的环境用到了http请求，请删除下面的baseURL启用上面的baseURL，并将11行、16行代码注释取消
  baseURL: '',
  timeout: 10000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};
const exportFileConfig: AxiosRequestConfig = {
  ...defaultConfig,
  timeout: 0,
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新token */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  // /** 重连原始请求 */
  // private static retryOriginalRequest(config: PureHttpRequestConfig) {
  //   return new Promise(resolve => {
  //     PureHttp.requests.push((token: string) => {
  //       config.headers["Authorization"] = formatToken(token);
  //       resolve(config);
  //     });
  //   });
  // }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        /** 请求白名单，放置一些不需要token的接口（通过设置请求白名单，防止token过期后再请求造成的死循环问题） */
        const whiteList = ['/api/auth/refreshToken'];
        return whiteList.some(v => config.url.indexOf(v) > -1)
          ? config
          : new Promise(resolve => {
              // const data = getToken();
              // if (data) {
              //   const now = new Date().getTime();
              //   const expired = parseInt(data.expires) - now <= 0;
              //   if (expired) {
              //     if (!PureHttp.isRefreshing) {
              //       PureHttp.isRefreshing = true;
              //       // token过期刷新
              //       useUserStoreHook()
              //         .refreshToken({ token: data.accessToken })
              //         .then(res => {
              //           const token = res.data.token;
              //           config.headers["Authorization"] = formatToken(token);
              //           PureHttp.requests.forEach(cb => cb(token));
              //           PureHttp.requests = [];
              //         })
              //         .finally(() => {
              //           PureHttp.isRefreshing = false;
              //         });
              //     }
              //     resolve(PureHttp.retryOriginalRequest(config));
              //   } else {
              //     config.headers["Authorization"] = formatToken(
              //       data.accessToken
              //     );
              //     return resolve(config);
              //   }
              // } else {
              return resolve(config);
              // }
            });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  //处理响应data
  private handleData = async (response: PureHttpResponse) => {
    // const { resetAll } = useUserStoreHook();
    const $config = response.config;
    // 关闭进度条动画
    NProgress.done();
    // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
    if (typeof $config.beforeResponseCallback === 'function') {
      $config.beforeResponseCallback(response);
      return response.data;
    }
    if (PureHttp.initConfig.beforeResponseCallback) {
      PureHttp.initConfig.beforeResponseCallback(response);
      return response.data;
    }

    const { data, status, statusText } = response;
    const statusName = 'code';
    // 若data.code存在，覆盖默认code
    let code = data && data[statusName] ? data[statusName] : status;
    // 若code属于操作正常code，则status修改为200
    if (codeVerificationArray.indexOf(data[statusName]) + 1) code = 200;
    switch (code) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式(指不管成功与否都有相应的数据格式)情况下进行处理
        // 例如响应内容：
        // 错误内容：{ code: 1, msg: '非法参数' }
        // 正确内容：{ code: 200, data: {  }, msg: '操作正常' }
        // return data
        if (
          ($config.url &&
            ($config.url?.indexOf("/Export") > -1 ||
              $config.url?.indexOf("/Template") > -1)) ||
          $config.responseType == "blob"
        ) {
          return response;
        } else {
          return response.data;
        }
      case 401:
        // resetAll().then(() => {
        //   router.push({ path: "/login", replace: true }).then(() => {});
        // });
        break;
      // case 402:
      //   return await tryRefreshToken(config);
      case 403:
        router.push({ path: '/403' }).then(() => {});
        break;
      case 1000:
        ElMessage({
          message: data.message,
          grouping: true,
          type: 'error',
        });
        return data;
    }
    // 异常处理
    // 若data.msg存在，覆盖默认提醒消息
    const errMsg = `${
      data && data[messageName]
        ? data[messageName]
        : CODE_MESSAGE[code]
          ? CODE_MESSAGE[code]
          : statusText
    }`;
    // 是否显示高亮错误(与errorHandler钩子触发逻辑一致)
    ElMessage({
      message: errMsg,
      grouping: true,
      type: 'error',
    });
    // if (needErrorLog())
    //   addErrorLog({ message: errMsg, stack: data, isRequest: true });
    return Promise.reject(data);
    // return response.data;
  };

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => this.handleData(response),
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        if ($error.response === undefined) {
          // 关闭进度条动画
          NProgress.done();
          // 所有的响应异常 区分来源为取消请求/非取消请求
          ElMessage({
            message: '网络不可用或服务地址无效',
            grouping: true,
            type: 'error',
          });
          // return Promise.reject($error);
          return {};
        } else {
          return this.handleData($error.response);
        }
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回掉
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    params?: T,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('post', url, params, config);
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: T,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('get', url, params, config);
  }
}
export const http = new PureHttp();

export function getBaseUrl(type: string) {
  switch (type) {
    case 'DOMAIN_BFW':
      return getConfig(type)
        ? getConfig(type)
        : import.meta.env.VITE_PROXY_DOMAIN_BFW;
    case 'DOMAIN_BUS':
      return getConfig(type)
        ? getConfig(type)
        : import.meta.env.VITE_PROXY_DOMAIN_BUS;
    case 'DOMAIN_FILE':
      return getConfig(type)
        ? getConfig(type)
        : import.meta.env.VITE_PROXY_DOMAIN_FILE;
    case 'DOMAIN_PREVIEW':
      return getConfig(type)
        ? getConfig(type)
        : import.meta.env.VITE_PROXY_DOMAIN_PREVIEW;
    case 'DOMAIN_GONGYI':
      return getConfig(type)
        ? getConfig(type)
        : import.meta.env.VITE_PROXY_DOMAIN_GONGYI;
  }
}
