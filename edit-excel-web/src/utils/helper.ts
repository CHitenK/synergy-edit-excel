import { ref } from "vue";
import { ElMessage } from "element-plus";

import { copyText } from "@/utils/index";

class Helper {
  userInfo = ref({});

  /* 处理登出 */
  handleLogout() {
    ElMessage.success("退出登录");
    this.userInfo.value = {};
    localStorage.removeItem("userInfo");
    localStorage.removeItem("lastLoginTime");
    window.location.reload();
  }
  /* 刷新登录时间 30天内无需在登录 */
  refreshLoginTime(id = "") {
    const val = `${id || Math.random()}_${new Date().getTime()}`;
    localStorage.setItem("lastLoginTime", val);
  }

  /* 处理登录 */
  handleLogin(user = {}) {
    this.userInfo.value = user;
    localStorage.setItem("userInfo", JSON.stringify(user));
    this.refreshLoginTime(user.id);
    window.location.reload();
  }

  /* 初始用户信息 */
  initUserInfo() {
    /* 获取用户信息 */
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      const user = JSON.parse(userInfoStr);
      const lastLoginTimeVal = localStorage.getItem("lastLoginTime") ?? "";
      if (lastLoginTimeVal?.includes(`${user.id}_`)) {
        const lastLoginTime = lastLoginTimeVal.split("_")[1];
        const nowTime = new Date().getTime();
        /* 30天内无需重新登录 */
        if (nowTime - lastLoginTime < 1000 * 60 * 60 * 24 * 30) {
          this.userInfo.value = user;
          this.refreshLoginTime(user.id);
        }
      }
    }
  }

  /* 分享链接 */
  shareUrl(code = "", fileType = "") {
    const origin = window.location.origin;
    const url = `${origin}/excel?code=${code}&fileType=${fileType}`;
    copyText(url, "链接已经复制到剪贴板");
  }
}

export default Helper;
