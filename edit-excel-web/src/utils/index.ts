import{  ElMessage }  from 'element-plus'


/* 防抖 */
export function debounce(func, delay = 1200) {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }
    // 设置新的定时器
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/* 随机码 num 多少位 */
export function randomNum(num = 6) {
  const n = Math.random() * 1000;
  const n1 = n.toString().replace(/\./g, "");
  /* 截取4位字符 */
  return n1.substring(0, num);
}

export function copyText(textToCopy = '', tip = '') {
  const textarea = document.createElement('textarea');
  textarea.value = textToCopy;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  // 将 textarea 元素添加到文档中
  document.body.appendChild(textarea);
  // 选中 textarea 中的文本
  textarea.select();
  try {
    // 执行复制命令
    const successful = document.execCommand('copy');
    const msg = successful ? '文本已成功复制到剪贴板' : '';
    if (msg) {
      ElMessage.success(tip || msg);
    } else {
      ElMessage.error('复制文本时出错');
    }
  } catch (err) {
      console.error('复制文本时出错:', err);
      ElMessage.error('复制文本时出错');
  }
  // 移除 textarea 元素
  document.body.removeChild(textarea);
}