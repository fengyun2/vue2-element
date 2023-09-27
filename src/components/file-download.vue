<template>
  <div class="demi">
    <el-button @click="fileZip">文件压缩</el-button>
    <el-button @click="downTxt">下载文本</el-button>
    <el-button @click="downURL">下载远程文件</el-button>
    <el-button @click="downCanvas">下载canvas文件</el-button>
    <el-button @click="downloadMultiFileByLink">下载多个文件-link</el-button>
    <canvas
      id="canvas-1"
      width="400"
      height="300"
      style="border: 1px solid #ccc"
    ></canvas>
  </div>
</template>

<script>
import JSZip from "jszip";
import { saveAs } from "file-saver";

function getFileBlob(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "blob";
    request.onload = (res) => {
      if (res.target.status === 200) {
        resolve(res.target.response);
      } else {
        reject(res);
      }
    };
    request.send();
  });
}

export default {
  data() {
    return {};
  },
  methods: {
    fileZip() {
      const imgData =
        "R0lGODdhBQAFAIACAAAAAP/eACwAAAAABQAFAAACCIwPkWerClIBADs=";
      const zip = new JSZip();
      zip.file("Hello.txt", "Hi, Girl!\n");
      zip.file("MM.txt", "美女你好呀\n");
      const img = zip.folder("images");
      img.file("simle.gif", imgData, { base64: true });
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "loveYou.zip");
      });
    },
    downTxt() {
      // const blob = new Blob(["Hello World!"], {
      //   type: "text/plain;charset=utf-8"
      // });
      // saveAs(blob, "hello world.txt");

      const file = new File(["Hello, world!"], "hello world.txt", {
        type: "text/plain;charset=utf-8"
      });
      saveAs(file);
    },
    downURL() {
      saveAs("https://httpbin.org/image", "image.jpg");
    },
    downCanvas() {
      const canvasEle = document.getElementById("canvas-1");
      const ctx = canvasEle.getContext("2d");
      const img = document.createElement("img");
      img.onload = function () {
        canvasEle.width = img.width;
        canvasEle.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvasEle.toBlob((blob) => {
          saveAs(blob, "beautiful girl.png");
        });
      };
      img.crossOrigin = "anonymous";
      img.src = "https://httpbin.org/image";
    },
    downloadMultiFileByLink() {
      const zip = new JSZip();
      let result = [];
      let files = [
        "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1645261335302/测试文档.doc",
        "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/lilinjian/1641631041478/dd.txt",
        "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1650420333942/123.xls",
        "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1641805597561/巴达兽.png"
      ];
      for (let i in files) {
        let promise = getFileBlob(files[i]).then((res) => {
          let format = files[i].substring(
            files[i].lastIndexOf("/"),
            files[i].length
          );
          console.warn(format, "format ====>");
          zip.file(format, res, { binary: true });
        });
        result.push(promise);
      }
      Promise.all(result).then(() => {
        zip.generateAsync({ type: "blob" }).then((res) => {
          // 1. saveAs 方式下载
          // saveAs(res, "文件.zip");

          // 2. a 标签下载
          // 下载的文件名
          var filename = "a标签方式打包下载.zip";
          // 创建隐藏的可下载链接
          var eleLink = document.createElement("a");
          eleLink.download = filename;
          eleLink.style.display = "none";
          // 下载内容转变成blob地址
          eleLink.href = URL.createObjectURL(res);
          // 触发点击
          document.body.appendChild(eleLink);
          eleLink.click();
          // 然后移除
          document.body.removeChild(eleLink);
        });
      });
    }
  }
};
</script>

<style>
</style>