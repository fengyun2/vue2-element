<template>
  <div id="app">
    <div class="btn-wrap">
      <el-button @click="showTableDemo = !showTableDemo">展示表格</el-button>
      <el-button @click="showCityDemo = !showCityDemo">展示城市组件</el-button>
      <el-button @click="showUserDemo = !showUserDemo">展示用户组件</el-button>
      <el-button @click="showImgCompressDemo = !showImgCompressDemo"
        >展示图片压缩组件</el-button
      >
      <el-button @click="showQRcodeReader = !showQRcodeReader"
        >展示二维码识别</el-button
      >
      <el-button @click="showWordComment = !showWordComment"
        >展示划词高亮</el-button
      >
      <el-button @click="showFileDownload = !showFileDownload"
        >文件下载</el-button
      >
      <el-button @click="showFileStreamDownload = !showFileStreamDownload"
        >流式文件下载</el-button
      >
    </div>
    <div class="demo-block">
      <HelloWorld v-if="showTableDemo" />
      <city-demo v-if="showCityDemo" />
      <el-input-number v-if="showUserDemo" v-model="amount" />
      <user-demo v-if="showUserDemo" :amount="amount" />
      <img-compress-demo v-if="showImgCompressDemo" />
      <QRcodeReader v-if="showQRcodeReader" />
      <WordComment v-if="showWordComment" />
      <FileDowload v-if="showFileDownload" />
      <EleTable v-if="showTableScroll" />
      <FileStreamDownload v-if="showFileStreamDownload" />
    </div>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import CityDemo from "./components/city-demo";
import UserDemo from "./components/user";
import ImgCompressDemo from "./components/img-compress";
import QRcodeReader from "./components/qrcode-reader";
import WordComment from "./components/word-comment";
import FileDowload from "./components/file-download";
import EleTable from "./components/ele-table";
import FileStreamDownload from "./components/file-stream-download";

export default {
  name: "App",
  components: {
    HelloWorld,
    CityDemo,
    UserDemo,
    ImgCompressDemo,
    QRcodeReader,
    WordComment,
    FileDowload,
    EleTable,
    FileStreamDownload
  },
  data() {
    return {
      showTableDemo: false,
      showCityDemo: false,
      showUserDemo: false,
      showImgCompressDemo: false,
      showQRcodeReader: false,
      showWordComment: false,
      showFileDownload: false,
      showTableScroll: false,
      showFileStreamDownload: false,
      amount: 0
    };
  },
  watch: {
    showUserDemo(value) {
      if (value) {
        this.changeAmount();
      }
    }
  },
  methods: {
    changeAmount() {
      setTimeout(() => {
        this.amount += 1;
      }, 500);
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}
</style>
