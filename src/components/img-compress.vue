<template>
  <div class="demo">
    <p>
      <input
        ref="file"
        id="file"
        type="file"
        accept="image/gif, image/png, image/jpg, image/jpeg"
        @change="onChangeFile"
      />
    </p>
    <div class="preview-demo">
      <img v-if="previewImgUrl" :src="previewImgUrl" />
    </div>
  </div>
</template>
<script>
import { filesize } from "filesize";
const imgTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const formatFileSize = (fileSize) => {
  return filesize(fileSize, { base: 2, standard: "jedec" });
};
// 压缩前将file转换成img对象
function readImg(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsDataURL(file);
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function (e) {
      reject(e);
    };
  });
}

/**
 * 压缩图片
 * @param {Image}img 被压缩的img对象
 * @param {string} type 压缩后转换的文件类型
 * @param {number} mx 触发压缩的图片最大宽度限制
 * @param {number} mh 触发压缩的图片最大高度限制
 * @param {number} quality 图片质量{0-1}
 */
function compressImg(img, type, mx, mh, quality = 0.4) {
  return new Promise((resolve, reject) => {
    // 压缩图片需要的canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    // 图片原始尺寸
    const { width: originWidth, height: originHeight } = img;
    // 目标尺寸
    let targetWidth = originWidth;
    let targetHeight = originHeight;
    // 宽高比
    // const scale = originWidth / originHeight;
    // 最大尺寸限制
    const maxWidth = mx;
    const maxHeight = mh;
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > 1) {
        // 宽图片
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
        // 高图片
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    }
    // canvas 对图片进行缩放
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // 清除画布
    context?.clearRect(0, 0, targetWidth, targetHeight);
    // 图片压缩
    context?.drawImage(img, 0, 0, targetWidth, targetHeight);
    // canvas转为blob，上传逻辑待补充
    canvas.toBlob(
      function (blob) {
        console.log("图片压缩后大小是：" + formatFileSize(blob.size));

        resolve(blob);
      },
      type || "image/png",
      quality
    );
  });
}

export default {
  name: "img-compress",
  data() {
    return {
      previewImgUrl: "",
    };
  },
  mounted() {},
  methods: {
    onChangeFile(e) {
      const file = e.target.files[0];
      if (imgTypes.includes(file.type)) {
        console.log("图片原大小是:" + formatFileSize(file.size));
        // 将file转换成img对象
        readImg(file).then((res) => {
          // TODO: 小于500KB，不做转换
          compressImg(res, file.type).then((blob) => {
            this.previewImg(blob);
          });
        });
      } else {
        console.log("选择的文件非图片，到此为止。");
      }
    },
    previewImg(blob) {
      // 在页面上预览图片
      const previewSrc = URL.createObjectURL(blob);
      this.previewImgUrl = previewSrc;
    },
  },
};
</script>