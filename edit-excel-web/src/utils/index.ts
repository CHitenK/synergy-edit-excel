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
