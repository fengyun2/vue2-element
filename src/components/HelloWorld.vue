<template>
  <div class="hello">
    <el-button @click="exportExcel">excel导出</el-button>
    <el-button @click="exportExcel2">excel导出2</el-button>
    <el-button @click="exportExcel3">excel导出3</el-button>
    <el-table ref="elTable" :data="tableData" style="width: 100%">
      <el-table-column prop="date" label="日期" sortable width="180">
      </el-table-column>
      <el-table-column prop="name" label="姓名" sortable width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址"
        sortable
        :formatter="formatter"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { exportExcelByClient, exportExcelByClient2 } from "@/utils/excel";
import { exportExcelByClient as exportExcelByClient3 } from "@/utils/excel_simple";
import dayjs from "dayjs";
export default {
  data() {
    return {
      tableData: [
        {
          date: "2023/01/01",
          name: "win",
          address: "广东省广州市番禺区小谷围街广州大学城外环西路100号(510006) ",
        },
        {
          date: "2023/01/02",
          name: "win",
          address: "广州市番禺区大学城外环东路132号（510006) ",
        },
        {
          date: "2023/01/03",
          name: "win",
          address: "中国广东省广州市番禺区外环东路382号（511436）",
        },
        {
          date: "2023/01/15",
          name: "win",
          address: "中国广东省广州市番禺区外环东路378号（510006）",
        },
      ],
    };
  },
  computed: {
    excelOptions() {
      // const columns = []
      return {
        filename: "员工列表",
        elTable: "elTable",
      };
    },
  },
  methods: {
    formatter(row, column) {
      return row.address + dayjs().format("YYYY-MM-DD HH:mm:ss");
    },
    exportExcel() {
      exportExcelByClient(this.excelOptions, this);
      // console.warn(this.$refs.elTable, "elTable ===>");
    },
    exportExcel2() {
      exportExcelByClient2(this.excelOptions, this);
    },
    exportExcel3() {
      exportExcelByClient3(this.excelOptions, this);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
