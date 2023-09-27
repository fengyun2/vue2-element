<template>
  <!-- height="250" -->
  <div class="box">
    <el-button type="primary" @click="toEnd"
      >滚动到最后一列的最后一个单元格</el-button
    >
    <el-table
      ref="table"
      class="ele-table-demo"
      :data="tableData"
      style="width: 100%"
      :cell-class-name="setCellClassName"
    >
      <el-table-column prop="date" label="Date" width="180" />
      <el-table-column prop="name" label="Name" width="280" />
      <el-table-column prop="nickname" label="NickName" width="280" />
      <el-table-column prop="age" label="Age" width="280" />
      <el-table-column prop="sex" label="Sex" width="280" />
      <el-table-column prop="birth" label="Birth" width="280" />
      <el-table-column prop="love" label="Love" width="280" />
      <el-table-column prop="address" label="Address" width="300" />
    </el-table>
  </div>
</template>

<script>
/**
 * 无法滚动到具体位置复现步骤：
 * 1. 触发滚动到文档的最底部（this.toDocumentEnd()）,且表格滚动条处于最左边
 * 2. 设置 .el-table__body-wrapper 为 scroll-behavior: smooth;
 * 3. 触发滚动到列表的最后一个单元格（this.toEnd()）
 */
const tableData = [
  {
    date: "2016-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-04",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-01",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-08",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-06",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-07",
    name: "Tom",
    address: "我是最后一行数据，请观察"
  }
];
export default {
  data() {
    return {
      tableData
    };
  },
  mounted() {
    // 滚动到文档的最底部
    this.toDocumentEnd();
  },
  methods: {
    setCellClassName({ row, column, rowIndex, columnIndex }) {
      return `ele-table-cell-${rowIndex + 1}-${columnIndex + 1}`;
    },
    toDocumentEnd() {
      // 获取要滚动到的元素，可以是页面的任何元素
      var element = document.documentElement; // 对于整个文档

      // 使用 scrollIntoView 滚动到底部
      element.scrollIntoView({ behavior: "smooth", block: "end" });
    },
    toEnd() {
      const lastElem = document.querySelector(".ele-table-cell-7-8");
      if (lastElem) {
        lastElem.scrollIntoViewIfNeeded();
      }
    }
  }
};
</script>
<style lang="scss">
.ele-table-demo {
  .el-table__body-wrapper {
    /* 2. 设置 scroll-behavior: smooth; */
    scroll-behavior: smooth;
    will-change: auto;
  }
}
</style>