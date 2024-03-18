import PickingFormDialog from './PickingFormDialog.vue';

export interface BOMItem {
  /** 【数据库字段】行主键ID */
  rowId: string;
  /** 【数据库字段】工单ID */
  workOrderId: string;
  /** 【数据库字段】物料ID */
  materialId: string;
  /** 【数据库字段】物料编码 */
  materialCode: string;
  /** 【数据库字段】物料名称 */
  materialName: string;
  /** 【数据库字段】规格型号 */
  specification: string;
  /** 【数据库字段】计量单位 */
  unitOfMeasure: string;
  /** 【数据库字段】预计使用量（MRP计算量） */
  quantityMrp: number;
  /** 【数据库字段】是否有回料(0-否 1-是) */
  isReuse: boolean;
  /** 【数据库字段】备注 */
  remarks: string;
  /** 【数据库字段】创建人 */
  creator: string;
  /** 【数据库字段】创建时间 */
  createTime: string;
  /** 【数据库字段】修改人 */
  modifier: string;
  /** 【数据库字段】修改时间 */
  modifyTime: string;
  /** 批次编号字扫码符串 */
  batchCodeScanStr: string;
  /** 批次编号字符串 */
  batchCodeStr: string;
  /** 批次编号数组 */
  batchCodeArray: Array<string>;
  /** 物料入库单明细 */
  materialReceiptRows: Array<MaterialReceiptItem>;
}

export interface MaterialReceiptItem {
  /** 【数据库字段】行主键ID */
  rowId: string;
  /** 【数据库字段】入库单ID */
  receiptId: string;
  /** 【数据库字段】采购订单明细ID */
  poRowId: string;
  /** 【数据库字段】采购订单ID */
  poId: string;
  /** 【数据库字段】采购订单编号 */
  poCode: string;
  /** 【数据库字段】物料ID */
  materialId: string;
  /** 【数据库字段】物料编码 */
  materialCode: string;
  /** 【数据库字段】物料名称 */
  materialName: string;
  /** 【数据库字段】规格型号 */
  specification: string;
  /** 【数据库字段】单位 */
  unitOfMeasure: string;
  /** 【数据库字段】入库数量 */
  quantityReceipt: number;
  /** 【数据库字段】出货数量 */
  quantityOutbound: number;
  /** 【数据库字段】批次编号，可以根据配置的规则，由系统自动生成；也可以手工填写 */
  batchCode: string;
  /** 【数据库字段】仓库ID */
  warehouseId: string;
  /** 【数据库字段】仓库编码 */
  warehouseCode: string;
  /** 【数据库字段】仓库名称 */
  warehouseName: string;
  /** 【数据库字段】库区ID */
  whsAreaId: string;
  /** 【数据库字段】库区编码 */
  whsAreaCode: string;
  /** 【数据库字段】库区名称 */
  whsAreaName: string;
  /** 【数据库字段】库位ID */
  whsLocationId: string;
  /** 【数据库字段】库位编码 */
  whsLocationCode: string;
  /** 【数据库字段】库位名称 */
  whsLocationName: string;
  /** 【数据库字段】有效期 */
  expireDate: string;
  /** 【数据库字段】备注 */
  remarks: string;
  /** 【数据库字段】创建人 */
  creator: string;
  /** 【数据库字段】创建时间 */
  createTime: string;
  /** 【数据库字段】修改人 */
  modifier: string;
  /** 【数据库字段】修改时间 */
  modifyTime: string;
  /** 在库数量 */
  quantityOnHand: number;
  /** 入库单编码 */
  receiptCode: string;
  /** 入库单名称 */
  receiptName: string;
  /** 入库日期 */
  receiptDate: string;
  /** 入库类型 1-采购入库 2-客供入库 3-加工入库 9-其它入库 */
  receiptType: number;
}

export interface PickingFormData {
  /** 【数据库字段】领料单主键ID */
  issueId: string | undefined;
  /** 【数据库字段】领料单编号 */
  issueCode: string;
  /** 【数据库字段】领料单名称 */
  issueName: string;
  /** 【数据库字段】工作站ID */
  workstationId: string | undefined;
  /** 【数据库字段】工作站编号 */
  workstationCode: string;
  /** 【数据库字段】工作站名称 */
  workstationName: string;
  /** 【数据库字段】生产工单ID */
  workOrderId: string | undefined;
  /** 【数据库字段】生产工单编号 */
  workOrderCode: string;
  /** 【数据库字段】生产工单名称 */
  workOrderName: string;
  /** 【数据库字段】产品数量（缺省和生产工单中生产数量一致，领料时可调整，此值为调整后数量，产品入库时缺省数量为此值） */
  quantityProduct: number;
  /** 【数据库字段】生产任务ID */
  taskId: string;
  /** 【数据库字段】生产任务编码 */
  taskCode: string;
  /** 【数据库字段】客户ID */
  clientId: string | undefined;
  /** 【数据库字段】客户编码 */
  clientCode: string;
  /** 【数据库字段】客户名称 */
  clientName: string;
  /** 【数据库字段】客户简称 */
  clientNick: string;
  /** 【数据库字段】领料日期 */
  issueDate: string;
  /** 【数据库字段】单据状态 1-草稿 2-已提交 */
  status: number;
  /** 【数据库字段】物料出库类型 1-领料出库 9-其他出库 */
  materialOutType: number;
  /** 【数据库字段】备注 */
  remarks: string;
  /** 【数据库字段】创建人 */
  creator: string;
  /** 【数据库字段】创建时间 */
  createTime: string | undefined;
  /** 【数据库字段】修改人 */
  modifier: string;
  /** 【数据库字段】修改时间 */
  modifyTime: string | undefined;
  /** 提交生产领料单明细 */
  materialIssueRows: Array<MaterialIssueRows>;
}

export interface MaterialIssueRows {
  /** 物料ID */
  materialId: string;
  /** 物料入库单明细ID，多个以逗号','分隔 */
  materialReceiptRowIds: string;
  /** 领料数量 */
  quantityTotalIssued: number;
  /** 来自于生产BOM/产品BOM中的 物料isReuse属性 */
  isReuse: boolean;
  /** 是否需要进行回料入库处理 */
  isReceipt: boolean;
}
