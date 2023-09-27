<template>
  <el-upload
    :file-list="fileList"
    class="upload-demo"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    :auto-upload="false"
    multiple
    :limit="3"
    :on-change="handleChange"
    accept="image/*"
  >
    <el-button type="primary">Click to upload</el-button>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500KB.
      </div>
    </template>
  </el-upload>
</template>
<script>
// import { BarcodeDetector as BarcodeDetectorPolyfill } from "@sec-ant/barcode-detector/pure";
import {
  // readBarcodesFromImageFile,
  readBarcodesFromImageData,
} from "@sec-ant/zxing-wasm/reader";
import jsQR from "jsqr";
// import QRcodeImg from '@/assets/QRcode.png'

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

export default {
  name: "qrcode-reader",
  data() {
    return {
      fileList: [],
    };
  },
  methods: {
    async handleChange(uploadFile, uploadFiles) {
      console.warn(uploadFiles, " uploadFiles =====>");
      this.fileList = uploadFiles.slice(-3);

      // const barcodeDetector = new BarcodeDetectorPolyfill({
      //   formats: ["qr_code"],
      // });

      // console.warn(uploadFile, ' uploadFile =====>')

      // const imageFile = await fetch(
      //   "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20world!"
      // ).then((resp) => resp.blob());
      // const imageFile = QRcodeImg

      const zxingReadOptions = {
        tryHarder: true,
        formats: ["QRCode"],
        maxSymbols: 1,
      };
      readImg(uploadFile.raw)
        .then(async (imageFile) => {
          // console.log(imageFile, ' imageFile =====>')
          /**
           * Read from image data
           */
          const imageData = await createImageBitmap(imageFile)
            .then((imageBitmap) => {
              const { width, height } = imageBitmap;
              const context = new OffscreenCanvas(width, height).getContext(
                "2d"
              );
              context.drawImage(imageBitmap, 0, 0, width, height);
              return context.getImageData(0, 0, width, height);
            })
            .catch((err) => {
              console.error("imageData 获取失败： ", err);
            });
          console.warn(imageData, " imageData =====>");

          const imageDataReadOutputs = await readBarcodesFromImageData(
            imageData,
            zxingReadOptions
          );

          console.log(imageDataReadOutputs?.[0]?.text); // Hello world!
          // barcodeDetector.detect(res).then(console.log);

          // jsQR 方式
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            // inversionAttempts: "dontInvert",
          });

          // if (code) {
          console.log("Found QR code", code);
          // }
        })
        .catch((err) => {
          console.warn(err, "  转换报错 ===>");
        });
    },
  },
};
</script>
