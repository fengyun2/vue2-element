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
 * 表格配置
 * @param {Object} excelOptions
 * @param {Object} vm vue this 实例
 */
export const getExportOptions = (excelOptions, vm) => {
  let exportOptions = {};
  if (excelOptions.api) {
    // TODO: 后端导出
    exportOptions = { ...excelOptions };
  } else {
    if (excelOptions.data) {
      exportOptions.data = {};
      exportOptions.data.rows = excelOptions.data.rows || [];
      exportOptions.data.columns = excelOptions.data.columns || null;
    }
    if (excelOptions.elTable) {
      exportOptions.elTable =
        vm.$refs?.[excelOptions.elTable] || excelOptions.elTable;
    }
  }
  exportOptions.filename =
    excelOptions.filename || `excel_${new Date().getTime().toString()}`;
  return exportOptions;
};

/**
 * 转换columns和rows
 * @param {Array} options 表格配置信息
 * @param {Object} vm vue this 实例
 * @returns {Object} {columns, rows} 表格数据
 */
export const getTableInfo = (options, vm) => {
  const excelOptions = getExportOptions(options, vm);
  let _rows = [];
  let _columns = [];

  if (excelOptions.elTable) {
    const { columns, data } = excelOptions.elTable;
    _columns = cloneDeep(columns);
    _rows = cloneDeep(data);
  } else if (excelOptions.data?.columns) {
    _columns = excelOptions.data.columns;
    _rows = excelOptions.data.rows || [];
  }
  return { columns: _columns, rows: _rows };
};

/**
 * 导出excel文件
 * @param {Object} table {columns, rows} 表格数据
 * @param {String} filename 文件名
 */
export const exportTableData = (table, filename) => {
  // 导出excel数据模型如下：
  // const data = [{"date":{"v":"日期"},"name":{"v":"姓名"},"address":{"v":"地址"}},{"date":{"v":"2016-05-02"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1518 弄"}},{"date":{"v":"2016-05-04"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1517 弄"}},{"date":{"v":"2016-05-01"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1519 弄"}},{"date":{"v":"2016-05-03"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1516 弄"}}]
  // 表格数据为空，中断导出
  if (!table?.rows?.length) {
    console.log("暂无数据");
    return;
  }

  const data = [];
  const headerKey = [];
  const headerLabel = {};
  const cellWidths = {};

  table.columns.forEach((column) => {
    const _field = column.property || column.prop;
    if (_field && column.label) {
      headerKey.push(_field);
      headerLabel[_field] = { v: column.label };
      cellWidths[_field] = getByteLength(column.label);
    }
  });

  data.push(headerLabel); // 设置表头

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
      lineData[key] = { v: _val };
      // 设置单元格最大宽度
      const cellWidth = getByteLength(_val);
      cellWidths[key] = Math.max(cellWidth, cellWidths[key]);
    }

    data.push(lineData);
  });

  // console.warn(data, " exportTableData - data");

  const sheetName = "Sheet1"; // 设置 sheetName
  const wb = XLSX.utils.book_new(); // 创建一个新的工作簿对象
  // 将js对象转为工作簿
  const ws = XLSX.utils.json_to_sheet(data, {
    header: Object.values(headerKey),
    skipHeader: true
  });
  // 设置列宽
  const colWidthArr = Object.values(cellWidths).map((width) => ({
    wch: width + 4 // 设置单元格宽度为字节数再加4个冗余字节
  }));
  ws["!cols"] = colWidthArr;
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;

  const defaultCellStyle = {
    font: { name: "Verdana", sz: 13, color: "FF00FF88" },
    fill: { fgColor: { rgb: "FFFFAA00" } }
  };
  const wopts = {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
    cellStyle: true,
    defaultCellStyle,
    showGridLines: false
  };
  XLSX.writeFile(
    wb,
    `${filename}${new Date().getTime().toString()}.xlsx`,
    wopts
  );
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

/**
 * 导出excel文件
 * @param {Object} table {columns, rows} 表格数据
 * @param {String} filename 文件名
 */
const exportTableData2 = (table, filename) => {
  // 导出excel数据模型如下：
  // const data = [{"date":{"v":"日期"},"name":{"v":"姓名"},"address":{"v":"地址"}},{"date":{"v":"2016-05-02"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1518 弄"}},{"date":{"v":"2016-05-04"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1517 弄"}},{"date":{"v":"2016-05-01"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1519 弄"}},{"date":{"v":"2016-05-03"},"name":{"v":"王小虎"},"address":{"v":"上海市普陀区金沙江路 1516 弄"}}]
  // 表格数据为空，中断导出
  if (!table?.rows?.length) {
    console.log("暂无数据");
    return;
  }

  const data = [];
  const headerKey = [];
  const headerLabel = {};
  const cellWidths = {};
  const headers = [];

  table.columns.forEach((column) => {
    const _field = column.property || column.prop;
    if (_field && column.label) {
      headerKey.push(_field);
      headerLabel[_field] = { v: column.label };
      cellWidths[_field] = getByteLength(column.label);
      headers.push(column.label);
    }
  });

  // data.push(headerLabel); // 设置表头

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
      // lineData[key] = { v: _val };
      lineData[_col.label] = _val;
      // 设置单元格最大宽度
      const cellWidth = getByteLength(_val);
      cellWidths[key] = Math.max(cellWidth, cellWidths[key]);
    }

    data.push(lineData);
  });

  console.warn(data, " exportTableData2 - data");

  const sheetName = "Sheet1"; // 设置 sheetName
  const wb = XLSX.utils.book_new(); // 创建一个新的工作簿对象
  // 将js对象转为工作簿
  const ws = XLSX.utils.json_to_sheet(data, {
    header: headers
  });
  // 设置列宽
  const colWidthArr = Object.values(cellWidths).map((width) => ({
    wch: width + 4 // 设置单元格宽度为字节数再加4个冗余字节
  }));
  ws["!cols"] = colWidthArr;
  wb.SheetNames.push(sheetName);
  wb.Sheets[sheetName] = ws;

  // const defaultCellStyle = {
  //   font: { name: "Verdana", sz: 13, color: "FF00FF88" },
  //   fill: { fgColor: { rgb: "FFFFAA00" } }
  // };
  // const wopts = {
  //   bookType: "xlsx",
  //   bookSST: false,
  //   type: "binary",
  //   cellStyle: true,
  //   defaultCellStyle,
  //   showGridLines: false
  // };
  XLSX.writeFileXLSX(
    wb,
    `${filename}${new Date().getTime().toString()}.xlsx`
    // wopts
  );
};

/**
 * 纯前端excel下载2
 * @param {Object} options
 * @param {Object} vm vue this 实例
 */
export const exportExcelByClient2 = (options, vm) => {
  const table = getTableInfo(options, vm);
  exportTableData2(table, options.filename);
};

/**
 * 通过后端接口下载
 * @param {Object} options
 * @param {Object} vm vue this 实例
 */
export const exportExcelByApi = (options, vm) => {};
