/*
划词评论需要的一些方法
*/

// 特定元素相对于选区居中定位
// target 表示悬浮定位元素
// 表示选区所在目标元素，可以缺省
/**
 * 特定元素相对于选区居中定位
 * @param {element} target 表示悬浮定位元素
 * @param {element} paragraph 表示选区所在目标元素，可以缺省
 * @param {enum} type 触发类型：select|hover
 */
export function showSelectionPopover(target, paragraph, type = "select") {
  // 获得选区
  const selection = document.getSelection();
  let selectContent = selection.toString();
  let selectContentTrim = selectContent.trim();
  const range = selection.getRangeAt(0);

  // 若不是划中选择的，则取用户点击所在的元素内容
  if (type !== "select") {
    selectContent = paragraph?.innerText || paragraph?.textContent || "";
    selectContentTrim = selectContent?.trim();
    // TODO: 点击时全选，以下代码待验证，是否有坑
    // 如果纯文本，使用当前节点
    if (!paragraph.children.length) {
      range.selectNode(range.startContainer);
    } else {
      // 如果包含子元素，则改变选区的起止点
      range.setStartBefore(paragraph.firstChild);
      range.setEndAfter(paragraph.lastChild);
    }
  }

  console.warn(selectContentTrim, " showSelectionPopover - selectContentTrim");
  if (!selectContentTrim || !target) {
    return;
  }

  // TODO: 这里有个坑，vue+prettier 会导致行/段落换行，然后导致 showSelectionPopover 中
  // paragraph.textContent 总是多出很多换行符(\n)，进而导致paragraph.textContent.indexOf(selectContentTrim) == -1不成立，
  // 所以这里先将 paragraph.textContent 改为 paragraph.innerText
  const paragraphTextContent =
    paragraph?.innerText || paragraph?.textContent || "";

  console.warn(paragraphTextContent, " paragraphTextContent =====>");
  // 如果有超出范围的内容
  if (paragraphTextContent?.indexOf(selectContentTrim) == -1) {
    return;
  }

  // 如果是全部内容选择
  // 重新修改选区
  if (
    paragraph &&
    selectContent != selectContentTrim &&
    paragraphTextContent === selectContentTrim
  ) {
    // 如果纯文本，使用当前节点
    if (!paragraph.children.length) {
      range.selectNode(range.startContainer);
    } else {
      // 如果包含子元素，则改变选区的起止点
      range.setStartBefore(paragraph.firstChild);
      range.setEndAfter(paragraph.lastChild);
    }

    selectContent = selectContentTrim;
  }

  const boundRange = range.getBoundingClientRect();

  // 定位处理
  // ps: 这里只处理窗体滚动的定位
  //     内部容器的滚动定位大家自行在这里修改处理

  target.style.display = "block";
  target.style.top =
    boundRange.top - target.clientHeight + window.pageYOffset - 5 + "px";

  if (boundRange.height > 30) {
    // 跨行了，右对齐
    target.style.left = boundRange.right - target.clientWidth + "px";
  } else {
    // 居中对齐
    target.style.left =
      boundRange.left + boundRange.width / 2 - target.clientWidth / 2 + "px";
  }
}

// 隐藏悬浮元素
export function hideSelectionPopover(target) {
  if (target) {
    target.style.display = "none";
  }
}

// 选区高亮
// selector 表示选区容器元素的选择器
export function doRangeWrapHighLight() {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  // 外面包裹标签
  const surround = document.createElement("span");
  surround.dataset.gid = "0";
  surround.className = "word active";

  try {
    range.surroundContents(surround);
  } catch (e) {
    console.error("选区不支持交叉覆盖");
    return;
  }
}

// 获取选区在元素内的起止索引值，以及选区内容
export function getContentAndIndex(selector = ".content") {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  let startNode = range.startContainer;
  let startOffset = range.startOffset;

  // 当前选区所在的元素
  let container = selection.anchorNode.parentElement.closest(selector);
  if (!container) {
    // 这个多半是双击框选
    container = selection.anchorNode.parentElement.querySelector(selector);
    if (
      !container &&
      selection.anchorNode.matches &&
      selection.anchorNode.matches(selector)
    ) {
      container = selection.anchorNode;
    }
    // 需要改变位置计算的起点
    if (container) {
      startNode = container.firstChild;
      // 可能是空节点
      if (!startNode.textContent) {
        startNode = startNode.nextSibling;
      }
      startOffset = 0;
    }
  }

  if (!container) {
    console.error("不支持的选区");
    return;
  }

  // 起始位置的计算
  let startIndex = 0;
  let loopIndex = function (dom) {
    [...dom.childNodes].some(function (node) {
      if (!node.textContent) {
        return;
      }
      // 节点匹配了
      // 不再遍历
      if (node == startNode) {
        startIndex += startOffset;

        return true;
      }

      if (startNode.parentNode == node) {
        loopIndex(node);

        return true;
      }

      startIndex += node.textContent.length;
    });
  };

  // container是内容的容器元素
  loopIndex(container);

  const selectContent = selection.toString().trim();
  // 结束索引
  let endIndex = startIndex + selectContent.length;

  // id结尾的data-*值
  const objDataId = Object.fromEntries(
    Object.entries({
      ...container.dataset
    }).filter(([key, val]) => /id$/.test(key))
  );

  return {
    ...objDataId,
    startIndex,
    endIndex,
    selectContent
  };
}

// 基于 DOM 获取现在所有划词选区的起止点和内容
export function getContentAndIndexList(target, selector) {
  if (!target) {
    return;
  }
  const divTmp = document.createElement("div");
  // 替换
  divTmp.innerHTML = target.innerHTML;
  // 最终返回的数据
  let operateCommentsList = [];
  // 遍历与匹配
  const getRange = function () {
    let eleWrod = divTmp.querySelector(selector);

    if (!eleWrod) {
      return;
    }

    let text = "";
    [...divTmp.childNodes].some(function (node) {
      if (node === eleWrod) {
        const selectContent = node.textContent;
        operateCommentsList.push({
          selectContent: selectContent,
          startIndex: text.length,
          endIndex: text.length + selectContent.length,
          gid: Number(node.dataset.gid)
        });

        // 节点替换
        node.replaceWith.apply(node, [...node.childNodes]);

        // 继续遍历
        getRange();

        return true;
      }

      text += node.textContent;
    });
  };

  getRange();

  return operateCommentsList;
}

// 反向高亮比较位置的实现
export function getNodeAndOffset(dom, start = 0, end = 0) {
  const arrTextList = [];
  const map = function (chlids) {
    [...chlids].forEach((el) => {
      if (el.nodeName === "#text") {
        arrTextList.push(el);
      } else if (el.textContent) {
        map(el.childNodes);
      }
    });
  };
  map(dom.childNodes);

  let startNode = null;
  let startIndex = 0;
  let endNode = null;
  let endIndex = 0;
  // 总的字符长度
  let total = startIndex;

  // 计算长度
  arrTextList.forEach(function (node) {
    if (startNode && endNode) {
      return;
    }
    let length = node.textContent.length;
    // 当前节点，总的长度范围
    const range = [total, total + length];
    // 看看，start和end有没有在其中
    // start在这个范围中
    // 可以确定startIndex了
    if (!startNode && start >= range[0] && start < range[1]) {
      startNode = node;
      startIndex = start - total;
    }
    // '我要' (0, 2)
    if (!endNode && end > range[0] && end <= range[1]) {
      endNode = node;
      endIndex = end - range[0];
    }
    total = total + length;
  });

  if (!startNode || !endNode) {
    return null;
  }

  return [startNode, startIndex, endNode, endIndex];
}
