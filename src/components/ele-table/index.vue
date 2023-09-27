<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
    <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
    <component :is="componentName" />
  </el-tabs>
</template>

<script>
import EleTable from "./ele-table";
export default {
  components: {
    EleTable
  },
  data() {
    return {
      activeName: "second",
      components: {
        first: "div",
        second: "EleTable",
        third: "span",
        fourth: "div"
      }
    };
  },
  computed: {
    componentName() {
      return this.components[this.activeName];
    }
  }
};
</script>