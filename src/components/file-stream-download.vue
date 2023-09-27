<template>
  <div class="demi">
    <el-button @click="downloadFileSync">同步下载</el-button>
  </div>
</template>

<script>
import streamSaver from "streamsaver";
import ZIP from "zip-stream";

/**
 * 同步下载打包（推荐）
 * @param {String} zipName 压缩包文件名
 * @param {Array} files 文件列表， 格式：[{name: '文件名', url: "文件下载地址"},...]
 */
function zipFiles(zipName, files) {
  console.log("同步下载打包开始时间：", new Date());
  // 创建压缩文件输出流
  const zipFileOutputStream = streamSaver.createWriteStream(zipName);
  // 创建下载文件流
  const fileIterator = files.values();
  const readableZipStream = new ZIP({
    async pull(ctrl) {
      const fileInfo = fileIterator.next();
      // 迭代终止
      if (fileInfo.done) {
        ctrl.close();
      } else {
        const { name, url } = fileInfo.value;
        return fetch(url).then((res) => {
          ctrl.enqueue({
            name,
            stream: () => res.body
          });
        });
      }
    }
  });
  if (window.WritableStream && readableZipStream.pipeTo) {
    // 开始下载
    readableZipStream.pipeTo(zipFileOutputStream).then(() => {
      console.log("同步下载打包结束时间：", new Date());
    });
  }
}

export default {
  data() {
    return {};
  },
  methods: {
    downloadFileSync() {
      const zipName = "同步批量压缩下载.zip";
      const files = [
        {
          name: "测试文档.doc",
          url:
            'https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1645261335302/测试文档.doc"'
        },
        {
          name: "dd.txt",
          url:
            "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/lilinjian/1641631041478/dd.txt"
        },
        {
          name: "123.xls",
          url:
            "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1650420333942/123.xls"
        },
        {
          name: "巴达兽.png",
          url:
            "https://im-1305783521.cos.ap-guangzhou.myqcloud.com/im/file/C13012345678/1641805597561/巴达兽.png"
        }
      ];
      zipFiles(zipName, files);
    }
  }
};
</script>

<style>
</style>