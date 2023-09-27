<template>
  <!-- 划词评论基本交互功能演示, 这里有个坑，vue+prettier 会导致行/段落换行，然后导致 showSelectionPopover 中 paragraph.textContent 总是多出很多换行符(\n)，进而导致paragraph.textContent.indexOf(selectContentTrim) == -1不成立 -->
  <div class="demo-box">
    <div id="container" class="container">
      <div id="article" class="article">
        <div class="content" data-pid="p0">
          《CSS新世界》上线1个月多一点，编辑跟我说居然已经重印了，说实话，有些意外，毕竟首印有
          4000 册呢，感谢大家的支持，果然，用心的作品总是会得到大家的认可。
        </div>
        <div class="content" contenteditable="true" data-pid="p1">
          大家尽管选便宜的时候买，京东每隔一段时间都会做活动，满100减50这种，趁这个时候买就好了，算下来，5折6折的样子，很划算，就这个时候买，不要觉得买的太便宜心里有负担，跟大家讲，哪怕京东买10块钱一本，也不影响我的版税收益的。
        </div>
        <textarea class="content" style="width: 100%" data-pid="p2">
尊敬的各位读者朋友们，大家好！今天是8月24号，周四，夜幕降临，我们的天空和心情却被一股强劲的风暴笼罩。近日的气象预报令人揪心，未来十天，我们将面临一场由冷空气引发的暴雨、大暴雨天气，更甚者，台风登陆的阴影也笼罩着沿海地区。洪涝灾害似乎已成必然，但我们不能袖手旁观，让我们紧握十日预报，共同筑起安全的家园。</textarea
        >
      </div>
      <div id="comment" class="comment">
        <div class="comment-header">评论<button id="shut">关闭</button></div>
        <ul id="result"></ul>
        <form class="comment-form" id="form">
          <textarea
            id="textarea"
            class="comment-filed"
            name="content"
            placeholder="评论内容"
            required
          ></textarea>
          <p>
            <button>提交</button>
          </p>
        </form>
      </div>
    </div>
    <!-- 悬浮评论按钮 -->
    <button id="popover" class="popover-button">+</button>
  </div>
</template>
<script>
import {
  showSelectionPopover,
  hideSelectionPopover,
  doRangeWrapHighLight,
  getContentAndIndex,
  getNodeAndOffset,
  getContentAndIndexList
} from "./util";
export default {
  name: "word-comment",
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 实际开发的时候
      // 内容的请求和评论数据的请求建议分开
      // 这里就偷懒了
      // 内容直接在页面显示了
      // 不影响功能的演示

      // 全局的选择器
      const selector = ".content";
      const body = document.body;
      const popover = document.querySelector("#popover");
      const form = document.querySelector("#form");
      const textarea = document.querySelector("#textarea");
      const comment = document.querySelector("#comment");
      const article = document.querySelector("#article");
      const result = document.querySelector("#result");
      const shut = document.querySelector("#shut");

      // 全部的数据
      const data = {
        data: []
      };

      // 高亮方法
      // 此方法不支持重复执行
      const doHighLight = function () {
        data.data.forEach((obj) => {
          const pid = obj.pid;
          const eleInput = document.querySelector(
            selector + '[data-pid="' + pid + '"]'
          );

          if (!eleInput) {
            return;
          }

          // 有可能有删除之类的
          const range = document.createRange();
          const nodes = getNodeAndOffset(
            eleInput,
            obj.startIndex,
            obj.endIndex
          );
          if (!nodes) {
            return;
          }

          range.setStart(nodes[0], nodes[1]);
          range.setEnd(nodes[2], nodes[3]);

          // 包裹元素
          const eleWrap = document.createElement("span");
          eleWrap.setAttribute("data-gid", obj.gid);
          eleWrap.className = "word";

          try {
            range.surroundContents(eleWrap);
          } catch (e) {
            console.error("存在不可高亮的元素，多半由于选区交叉导致");
          }
        });
      };

      //--------
      // 先请求划词数据
      // fetch("./cgi/data.json")
      //   .then((res) => res.json())
      //   .then((json) => {
      //     if (json.code === 1 && json.data) {
      //       data.data = json.data;

      //       // 高亮
      //       doHighLight();
      //     }
      //   });
      this.getData().then((json) => {
        data.data = json;
        // 高亮
        doHighLight();
      });

      // ----------
      // 划词事件处理
      // 显示选区悬浮按钮
      body.addEventListener("mouseup", function (event) {
        const eleTarget = event.target;
        hideSelectionPopover(popover);

        if (eleTarget.closest && eleTarget.closest(selector)) {
          showSelectionPopover(popover, eleTarget, "hover");
        }
        if (!eleTarget.closest(".word") && !comment.contains(eleTarget)) {
          doRemoveActive();
        }
      });
      // 浏览器尺寸改变时候，浮层的定位
      window.addEventListener("resize", function () {
        const selection = document.getSelection();
        const eleClicked =
          selection.anchorNode.parentElement || selection.anchorNode;
        let eleTarget =
          eleClicked.closest(selector) || eleClicked.querySelector(selector);
        if (selection.toString().trim() && eleTarget) {
          showSelectionPopover(popover, eleTarget);
        }
      });

      // 点击评论按钮，显示评论输入框
      popover.addEventListener("click", function () {
        // 起止点和选区内容
        form.sendData = getContentAndIndex(selector);
        // 那就是如果起止点和选区内容之前就有，一模一样
        // 直接显示评论
        // ps: form.sendData 可能包含其他不需要的属性
        //     比方说段落容器元素上还有 data-xxxid
        //     则这里执行对比之前，需要先删除整个
        //     delete form.sendData.xxxid
        //     或者下面使用其他的对比算法
        //     例如 Object.keys(form.sendData) 改成 ['startIndex', 'endIndex', 'pid', 'selectContent']
        let objCommMatch = null;
        let isSameRange = data.data.some((obj) => {
          if (
            Object.keys(form.sendData).every(
              (key) => form.sendData[key] == obj[key]
            )
          ) {
            objCommMatch = obj;
            return true;
          }
          return false;
        });

        if (!isSameRange) {
          // 选区高亮
          doRangeWrapHighLight();
          // 评论显示
          comment.classList.add("active");
          form.elements[0].disabled = form.elements[1].disabled = false;
          textarea.focus();
        } else if (objCommMatch) {
          let eleWord = document.querySelector(
            '.word[data-gid="' + objCommMatch.gid + '"]'
          );
          // 实际开发中，这里还应该包含对应评论高亮的逻辑
          // 本演示省略
          eleWord.click();
        }
      });

      // 点击划词高亮
      article.addEventListener("click", function (event) {
        let eleTarget = event.target;
        if (!eleTarget.classList.contains("word")) {
          return;
        }
        // 如果当前已激活，不处理
        if (eleTarget.classList.contains("active")) {
          return;
        }

        const eleWordActive = document.querySelector(".word.active");
        if (eleWordActive) {
          eleWordActive.classList.remove("active");
        }

        eleTarget.classList.add("active");

        // 评论显示
        comment.classList.add("active");

        // 对应的评论卡片高亮
        // 本演示就单纯显示评论内容了
        result.innerHTML = data.data
          .find((obj) => obj.gid == eleTarget.dataset.gid)
          .commentDetail.map((obj) => `<li>${obj.content}</li>`)
          .join("");
        form.elements[0].disabled = form.elements[1].disabled = false;
      });

      // 取消划词的激活态
      const doRemoveActive = function () {
        // 取消激活态
        const eleWrapActive = document.querySelector(".word.active");
        if (eleWrapActive) {
          eleWrapActive.classList.remove("active");
          result.innerHTML = "";
          form.elements[0].disabled = form.elements[1].disabled = true;
        }
      };

      // 关闭评论侧边栏
      shut.addEventListener("click", function () {
        comment.classList.remove("active");
        doRemoveActive();
      });

      // 评论极简示意
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        let eleWordActive = document.querySelector(".word.active");
        if (!eleWordActive) {
          return;
        }

        const content = form.elements[0].value.trim();

        let gid = eleWordActive.dataset.gid;

        // 请求的数据
        let postData = {
          ...form.sendData
        };

        let objMatch = {};

        // 如果是已有划词评论新增评论
        if (gid != "0") {
          objMatch = data.data.find((obj) => obj.gid == gid);
          postData = {
            ...objMatch
          };
          delete postData.commentDetail;
        }

        postData.content = content;

        console.log("请求的数据是：", postData);

        // 模拟请求
        // 1. 按钮禁用
        form.elements[1].disabled = true;
        // 2. 发请求，这里定时器模拟
        setTimeout(function () {
          // 新数据
          // 如果是数据驱动的框架
          // 这里就会触发视图刷新
          // 我们这里就不管了，随便示意下
          const commentData = {
            cid: "cid" + setTimeout(0),
            content: postData.content
          };
          // 新数据，随便用个 gid 代替下
          if (gid == "0") {
            gid = "gid" + setTimeout(0);
            // 新数据
            data.data.push({
              ...postData,
              gid: gid,
              commentDetail: [commentData]
            });
            // 高亮选区的gid变化，不再是0
            let eleWordActive = document.querySelector(".word.active");
            eleWordActive.dataset.gid = gid;
          } else {
            objMatch.commentDetail.push(commentData);
          }

          // 评论显示
          result.innerHTML = (objMatch.commentDetail || [commentData])
            .map((obj) => `<li>${obj.content}</li>`)
            .join("");
          // 按钮恢复
          form.elements[1].disabled = false;
          // 内容重置
          form.reset();

          delete form.sendData;
        }, 20);
      });

      // 编辑内容时候，实时保存现在的划词起止位置和划词内容
      document.querySelectorAll(selector).forEach((eleInput) => {
        eleInput.timerHandle = null;
        eleInput.addEventListener("input", function () {
          clearTimeout(this.timerHandle);
          this.timerHandle = setTimeout(() => {
            const arrWordList = getContentAndIndexList(this, ".word");
            // 这就是划词评论新的数据
            console.log(arrWordList);
            // 正式开发场景下，这个数据需要保存到后端
            // 然后，如果data.data 中的 gid 出现和 arrWordList 不匹配的
            // 应该做相应的处理
            // 这里就不演示了……
          }, 300);
        });
      });
    },
    getData() {
      return new Promise((resolve, reject) => {
        import("./data.json")
          .then((json) => {
            if (json.code === 1 && json.data) {
              resolve(json.data);
            } else {
              reject();
            }
          })
          .catch(reject);
      });
    }
  }
};
</script>
<style>
.demo-box {
  margin-inline: auto;
}
h1 {
  font-size: 200%;
  margin: 1em 0 0.75em;
}
h3 {
  font-size: 125%;
  margin: 1em 0 0.75em;
}
.container {
  display: flex;
  border: 1px solid #ccc;
  border-top: solid #999;
  min-height: calc(100vh - 400px);
}
.comment {
  width: 28%;
  border-left: 1px solid #ccc;
  margin-left: 1em;
}
.article {
  flex: 1;
  padding: 1rem;
}
.comment:not(.active) {
  display: none;
}
.comment-header {
  display: flex;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
}
.comment-form {
  padding: 1rem;
}
.comment-header button {
  margin-left: auto;
}
.comment-filed {
  box-sizing: border-box;
  width: 100%;
  height: calc(4.5em + 6px);
  padding: 6px 8px;
  line-height: 1.5;
}

.content {
  line-height: 1.75;
  margin-block: 1em;
}
.content .word {
  border-bottom: 1px solid #ffd666;
  padding-bottom: 1px;
}
.word.active {
  background-color: #fffbe6;
}
[contenteditable] {
  border: 1px solid #ddd;
  padding: 0.5em;
}
/* 跟随选区的悬浮按钮 */
.popover-button {
  position: absolute;
  z-index: 9;
  display: none;
}
textarea,
button {
  font-size: 0.875rem;
}
</style>