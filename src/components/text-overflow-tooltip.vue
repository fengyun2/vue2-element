<template>
  <el-tooltip
    ref="textOverflowTooltipPopper"
    manual
    v-model="showOverflowTooltip"
    :content="content"
    effect="dark"
    placement="right"
  >
    <div
      ref="overflowTooltip"
      class="overflow-tooltip"
      :style="{ maxWidth: maxWidth }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ content }}
    </div>
  </el-tooltip>
</template>
 
<script>
// 参考文档：https://juejin.cn/post/7104400236000313375
import { debounce } from "lodash-es";
export default {
  name: "text-overflow-tooltip",
  props: {
    content: [String, Number, Boolean],
    maxWidth: {
      type: String,
    },
    containerRef: [Object],
  },
  data() {
    return {
      // title: "",
      showOverflowTooltip: false,
    };
  },
  // watch: {
  //   content: {
  //     immediate: true,
  //     handler() {
  //       this.$nextTick(() => {
  //         this.doLayout();
  //       });
  //     },
  //   },
  // },
  created() {
    // this.$nextTick(() => {
    //   this.watchParentDomChange();
    // });
    this.activateTooltip = debounce(
      (tooltip) => tooltip.handleShowPopper(),
      50
    );
  },
  methods: {
    // watchParentDomChange() {
    //   // 目标元素
    //   const targetElement = this.containerRef
    //     ? this.containerRef.$el
    //     : this.$parent.$el;
    //   // console.warn(
    //   //   targetElement instanceof HTMLElement,
    //   //   "targetElement =====>"
    //   // );
    //   if (!targetElement || !(targetElement instanceof HTMLElement)) {
    //     return;
    //   }
    //   // 创建一个MutationObserver实例
    //   const observer = new MutationObserver((mutations) => {
    //     mutations.forEach((mutation) => {
    //       // if (mutation.type === "characterData") {
    //       //   console.log(`文本节点内容发生变化：${mutation.target.nodeValue}`);
    //       //   // 执行相应的处理逻辑
    //       // }
    //       console.log("父组件发生变化");
    //       this.debounceDoLayout();
    //     });
    //   });

    //   // 配置观察器
    //   const config = {
    //     characterData: true,
    //     childList: true,
    //   };

    //   // 启动观察器
    //   observer.observe(targetElement, config);

    //   this.$once("hook:beforeDestroy", function () {
    //     observer.disconnect();
    //   });
    // },
    handleMouseEnter() {
      // this.debounceDoLayout();
      this.doLayout();
    },
    handleMouseLeave() {
      this.destroyTextOverflowTooltipPopper();
    },
    debounceDoLayout: debounce(function () {
      this.doLayout();
    }, 100),
    doLayout() {
      const el = this.$refs.overflowTooltip;
      if (!el) {
        this.showOverflowTooltip = false;
        return;
      }
      const elComputed = document.defaultView.getComputedStyle(el, "");
      const padding =
        parseInt(elComputed.paddingLeft.replace("px", ""), 10) +
        parseInt(elComputed.paddingRight.replace("px", ""), 10);

      const range = document.createRange();
      range.setStart(el, 0);
      range.setEnd(el, el.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;

      if (
        rangeWidth + padding > el.offsetWidth ||
        el.scrollWidth > el.offsetWidth
      ) {
        // this.title = this.content;
        this.showOverflowTooltip = true;
      } else {
        this.showOverflowTooltip = false;
      }
      if (this.showOverflowTooltip) {
        this.activateTextOverflowTooltipPopper();
      } else {
        this.destroyTextOverflowTooltipPopper();
      }
    },
    // 激活 Tooltip
    activateTextOverflowTooltipPopper() {
      const tooltip = this.$refs.textOverflowTooltipPopper;
      if (!tooltip) {
        return;
      }
      tooltip.referenceElm = this.$refs.overflowTooltip;
      tooltip.doDestroy();
      tooltip.setExpectedState(true);
      this.activateTooltip(tooltip);
    },
    // 销毁 Tooltip
    destroyTextOverflowTooltipPopper() {
      this.showOverflowTooltip = false;
      const tooltip = this.$refs.textOverflowTooltipPopper;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
    },
  },
};
</script>
 
<style scoped>
.overflow-tooltip {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* line-height: 1; */
  vertical-align: middle;
}
</style>