// 节流函数实现（时间戳法）
function throttle(func, limit = 2000) {
  let lastTime = 0;
  return function () {
    const context = this;
    const args = arguments;
    const now = Date.now();

    if (now - lastTime >= limit) {
      func.apply(context, args);
      lastTime = now;
    }
  }
}


exports.throttle = throttle;