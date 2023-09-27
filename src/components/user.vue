<template>
  <div class="demo">
    <el-input v-model="userName" placeholder="请输入用户名" />
    <el-button type="primary" @click="getUserInfo">获取用户信息</el-button>
    <p>用户名：{{ user.login || "" }}</p>
  </div>
</template>

<script>
import { getUserInfo } from "@/utils/utils";
export default {
  name: "user",
  props: {
    amount: { type: Number },
  },
  data() {
    return {
      userName: "fengyun2",
      user: {},
    };
  },
  watch: {
    amount(value) {
      console.warn("watch amout change: ", value);
    },
  },
  methods: {
    async getUserInfo() {
      await getUserInfo(this.userName)
        .then((res) => {
          console.log("userInfo: ", res?.data);
          this.user = res.data || {};
        })
        .catch((err) => {
          this.user = {};
          console.error("查询报错：", err?.code + ": " + err?.message);
        });
    },
  },
};
</script>

<style>
</style>