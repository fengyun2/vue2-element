<template>
  <el-popover placement="bottom" width="384" trigger="click">
    <city-picker />
    <el-button slot="reference">展示城市组件</el-button>
  </el-popover>
</template>

<script>
import CityPicker from "./city-picker";
export default {
  name: "city-demo",
  components: {
    CityPicker,
  },
};
</script>

<style>
</style>