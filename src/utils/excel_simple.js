import * as XLSX from "xlsx";
import { cloneDeep } from "lodash-es";

/**
 * 获取字节长度
 * @param {String} str 字符串
 */
const getByteLength = (str) => {
  if (!str) return 0;
  return new TextEncoder().encode(str).length;
};

/**
 * 转换columns和rows
 * @param {Array} options 表格配置信息
 * @param {Object} vm vue this 实例
 * @returns {Object} {columns, rows} 表格数据
 */
export const getTableInfo = (options, vm) => {
  const excelOptions = {};
  if (options.data) {
    excelOptions.data = {};
    excelOptions.data.rows = options.data.rows || [];
    excelOptions.data.columns = options.data.columns || null;
  }
  if (options.elTable) {
    excelOptions.elTable = vm.$refs?.[options.elTable] || options.elTable;
  }
  excelOptions.filename =
    options.filename || `export_excel_${new Date().getTime().toString()}`;

  let _rows = [];
  let _columns = [];
  if (excelOptions.elTable) {
    const { columns, data } = excelOptions.elTable;
    _columns = cloneDeep(columns);
    _rows = cloneDeep(data);
  } else if (excelOptions.data?.columns) {
    _columns = cloneDeep(excelOptions.data.columns);
    _rows = cloneDeep(excelOptions.data.rows || []);
  }
  return { columns: _columns, rows: _rows };
};

/**
 * 导出excel文件
 * @param {Object} table {columns, rows} 表格数据
 * @param {String} filename 文件名
 */
const exportTableData = (table, filename) => {
  // 表格数据为空，中断导出
  if (!table?.rows?.length) {
    console.error("暂无数据");
    return;
  }

  const data = [];
  const headerKey = [];
  const cellWidths = {};
  const headers = [];

  table.columns.forEach((column) => {
    const _field = column.property || column.prop;
    if (_field && column.label) {
      headerKey.push(_field);
      cellWidths[_field] = getByteLength(column.label);
      headers.push(column.label);
    }
  });

  // 设置表格数据
  table.rows.forEach((row, index) => {
    const lineData = {};
    for (let key of headerKey) {
      const _col = table.columns.find(
        (item) => item.property === key || item.prop === key
      );
      let _val = "";
      if (_col && typeof _col?.formatter === "function") {
        _val = _col.formatter(row);
      } else if (Object.hasOwn(row, `${key}Text`)) {
        _val = row[`${key}Text`];
      } else if (_col?.type === "index") {
        _val = index + 1;
      } else {
        _val = row[key];
      }
      lineData[_col.label] = _val;
      // 设置单元格最大宽度
      const cellWidth = getByteLength(_val);
      cellWidths[key] = Math.max(cellWidth, cellWidths[key]);
    }

    data.push(lineData);
  });

  console.warn(data, " export data ==>");

  const sheetName = "Sheet1"; // 设置 sheetName
  const wb = XLSX.utils.book_new(); // 创建一个新的工作簿对象
  // 将js对象转为工作簿
  const ws = XLSX.utils.json_to_sheet(data, {
    header: headers
  });
  // 设置列宽
  const colWidthArr = Object.values(cellWidths).map((width) => ({
    wch: width
  }));
  ws["!cols"] = colWidthArr;
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;

  XLSX.writeFileXLSX(wb, `${filename}${new Date().getTime().toString()}.xlsx`);
};

/**
 * 纯前端excel下载
 * @param {Object} options
 * @param {Object} vm vue this 实例
 */
export const exportExcelByClient = (options, vm) => {
  const table = getTableInfo(options, vm);
  exportTableData(table, options.filename);
};
