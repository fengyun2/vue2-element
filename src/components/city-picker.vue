<template>
  <el-cascader-panel class="city-picker" :options="options" ref="cityPicker">
    <template slot-scope="{ data }">
      <text-overflow-tooltip
        :content="data.label"
        :containerRef="$refs.cityPicker"
      />
    </template>
  </el-cascader-panel>
</template>

<script>
import TextOverflowTooltip from "./text-overflow-tooltip";
export default {
  name: "city-picker",
  components: {
    TextOverflowTooltip,
  },
  data() {
    return {
      that: this,
      options: [
        {
          label: "浙江",
          value: "Zhejiang",
          children: [
            {
              label: "浙江/杭州",
              value: "Hangzhou",
              children: [
                { label: "浙江/杭州/西湖区", value: "Xihu" },
                { label: "浙江/杭州/余杭区", value: "Yuhang" },
              ],
            },
            {
              label: "浙江/温州",
              value: "Wenzhou",
              children: [
                { label: "浙江/温州/鹿城区", value: "Lucheng" },
                { label: "浙江/温州/瓯海区", value: "Ouhai" },
              ],
            },
          ],
        },
        {
          label: "福建",
          value: "Fujian",
          children: [
            {
              label: "福建/福州",
              value: "Fuzhou",
              children: [
                { label: "福建/福州/鼓楼区", value: "Gulou" },
                { label: "福建/福州/台江区", value: "Taijiang" },
              ],
            },
            {
              label: "福建/厦门",
              value: "Xiamen",
              children: [
                { label: "福建/厦门/思明区", value: "Siming" },
                { label: "福建/厦门/海沧区", value: "Haicang" },
              ],
            },
          ],
        },
      ],
    };
  },
  mounted() {},
};
</script>

<style>
.city-picker .el-cascader-menu {
  min-width: 120px;
  /* width: 130px; */
}
.city-picker .el-cascader-node {
  font-weight: normal;
}
.city-picker .el-scrollbar__bar {
  transition-duration: 0s;
}
.city-picker .el-cascader-menu:last-child .el-cascader-node {
  padding-right: 20px !important;
}
.city-picker .el-cascader-menu:last-child {
  border-right-width: 1px;
}
</style>