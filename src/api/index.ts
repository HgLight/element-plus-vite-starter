import { http } from "../utils/http";

import { getBaseUrl } from "../utils/http";

// 获取服务器时间
export const getTime = (params?: object) => {
  return http.request<any>(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Home/GetTime",
    {
      params
    }
  );
};

// 获取明细
export function getFlowCard (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") + "/api/WorkTask/GetFlowCard",{
    params
  })
}

/**
 * 根据产品id及数量获取列表
 * @param {*} params
 * @returns
 */
export function getWorkOrderBomList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/WorkOrderBom/GetWorkOrderBomList',{
    params
  })
}

// 获取检测模板-检测模板中工序及检测项信息
export function getCheckProcessList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/CheckProcess/GetCheckProcessList',{
    params
  })
}

/**
 * 根据产品id及数量获取列表
 * @param {*} params
 * @returns
 */
export function getWorkOrderBomTempList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/WorkOrderBom/GetTempList',{
    params
  })
}

/**
 * 根据任务Id获取缺陷记录
 * @param {} params
 * @returns
 */
export function getWorkFeedbackDefectListByTaskId (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/WorkFeedbackDefect/GetListByTaskId',{
    params
  })
}

/**
 * 后期常见缺陷
 * @param {*} params 入参
 * @returns 返回值
 */
export function getDefectListNv (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/Defect/GetListNv',{
    params
  })
}

/**
 * 删除报工缺陷
 * @param {*} data
 * @returns
 */
export function deleteWorkFeedbackDefect (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/WorkFeedbackDefect/Delete',{
    data
  })
}

/**
 *
 * @param {添加缺陷记录} data
 * @returns
 */
export function addWorkFeedbackDefect (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/WorkFeedbackDefect/Add',{
    data
  })
}

// 工序开始
export function startWorkTask (data:object) {
  return http.request<any>( 'post',getBaseUrl("DOMAIN_BUS") +'/api/WorkTask/Start',{
    data
  })
}

// 工序结束
export function finishWorkTask (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/WorkTask/Finish',{
    data
  })
}

// 工作站NV
export function getWorkstationListNv (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/Workstation/GetListNv',{
    params
  })
}

// 提交领料
export function addIssueHeader (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/IssueHeader/Add',{
    data
  })
}

// 修改生产任务
export function saveWorkFeedback (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/WorkFeedback/Save',{
    data
  })
}

// 添加产品入库单
export function addProductReceiptHeader (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/ProductReceiptHeader/AddForGongYi',{
    data
  })
}

// 获取仓库树
export function getWarehouseTree (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/Warehouse/GetWarehouseTree',{
    params
  })
}

// 入库
export function generateCode (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BUS") +'/api/AutoCodeRule/GenerateCode',{
    data
  })
}

// 获取产品详情
export function getProductDetail (params:object) {
  return http.request<any>('get','getBaseUrl("DOMAIN_BUS") +/api/Product/GetOne',{
    params
  })
}

// 先行
export function SelectDetail1 (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'ProductionCard/SelectDetail1',{
    params
  })
}

// 查询质检
export function getCheckReportPages (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/CheckReportHeader/GetPages',{
    params
  })
}

// 设备
export function getMachineryList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/Machinery/GetListNvByProcessId',{
    params
  })
}

// 模具
export function getMouldList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/Moulds/GetListNv',{
    params
  })
}

// 操作人
export function getOperatorList (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BUS") +'/api/WorkFeedback/GetListNvByDeptId',{
    params
  })
}

// 根据配置键名获取配置详情
export function getConfigByConfigKey (params:object) {
  return http.request<any>('get',getBaseUrl("DOMAIN_BFW")  + '/api/Config/GetConfigByConfigKey',{
    params
  })
}

// 登录
export function postLogin (data:object) {
  return http.request<any>('post',getBaseUrl("DOMAIN_BFW")  + '/api/auth/getToken',{
    data
  })
}

export function exportExcel (tempUrl: string, fileName: string, form: { [x: string]: string; workOrderCode?: any; exportType?: any; }, _blobType: string | undefined) {
  let buffer = ''
  for (const key in form) {
    if (Object.prototype.hasOwnProperty.call(form, key)) {
      buffer += key + '=' + form[key] + '&'
    }
  }
  if (buffer.length > 0) {
    buffer = buffer.substring(0, buffer.length - 1)
  }
  const url =getBaseUrl("DOMAIN_BUS") + tempUrl + buffer

  return new Promise((resolve, reject) => {
    http.request<any>('get',url,{
      responseType: 'blob' // 服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
    })
      .then((res) => {
        // BlobPart;
        const { data, headers } = res
        const contentDisposition = headers['content-disposition']
        const contentType = headers['content-type']
        if (contentDisposition) {
          const name1 = contentDisposition.split(';')[2]
          if (name1) {
            const name2 = name1.split('filename*=')[1]
            if (name2) {
              const name3 = name2.split("''")[1]
              if (name3) {
                const name4 = name3.split('.')[0]
                if (name4) {
                  fileName = decodeURI(name4)
                }
              }
            }
          }
        }
        if (!data) {
          resolve(null)
          return
        }
        let blobType =
          form.exportType && form.exportType !== '1' && form.exportType !== '2'
            ? form.exportType === 'excel'
              ? _blobType === 'xls'
                ? 'application/vnd.ms-excel'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : form.exportType === 'word'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : form.exportType === 'pdf'
                  ? 'application/pdf'
                  : 'text'
            : _blobType === 'xls'
              ? 'application/vnd.ms-excel'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        if (contentType) {
          blobType = contentType
        }
        const blob = new Blob([data], {
          type: blobType
          // type: "application/vnd.ms-excel" //xls
          // type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" //xlsx
        })
        // const nav = window.navigator
        // if (nav.msSaveOrOpenBlob) {
        //   // 兼容IE10
        //   nav.msSaveBlob(blob, fileName)
        // } else {
          const href = URL.createObjectURL(blob) // 创建新的URL表示指定的blob对象
          // window.open(href);
          const a = document.createElement('a') // 创建a标签
          a.style.display = 'none'
          a.href = href // 指定下载链接
          a.download = fileName // 指定下载文件名
          a.click() // 触发下载
          URL.revokeObjectURL(href) // 释放URL对象
        // }
        // 这里也可以不创建a链接，直接window.open(href)也能下载
        resolve(null)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
};
