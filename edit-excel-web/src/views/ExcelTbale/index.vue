
<template>
  <div class="home-head-warp layout-h layout-space-between">
    <div class="layout-h layout-h-center">
      <el-icon color="#666" :size="16"  class="gutter-h cursor" title="首页"  @click="goHome"><HomeFilled /></el-icon>
      <span>当前文件[{{ ['共享', '私有', '开放'][currentFile.fileType] }}文件]：</span>
      <div style="font-size: 14px; color: var(--el-color-primary); text-decoration: underline;" class="gutter-h">
        {{ currentFile.name }} 
      </div>
      <!-- <span>在线编辑人数： 人</span> -->
    </div>
    <div class="layout-h layout-h-center" style="font-size: 14px; color: var(--el-color-warning);" v-if="!userInfo.id && currentFile.fileType === 0">
      <span>注意: 本文件为共享文件， 需要用户登录后，填写共享码成为文件共享者，才有相关权限！</span>
    </div>
    
    <div class="layout-h layout-h-center"  >
      <span class="gutter-h cursor" style="font-size: 12px; color: var(--el-color-info);" v-if="currentFile.fileType === 2 && showWatermark">开放码校验</span>
      <template v-if="!(!userInfo.id && currentFile.fileType === 0)">
        <span class="gutter-h cursor" style="font-size: 12px; color: var(--el-color-info);" @click="handleDownLoad" >导出表格</span>
        <span class="gutter-h cursor" style="font-size: 12px; color: var(--el-color-info);" @click="shareUrl">分享链接</span>
      </template>
      
      <template  v-if="userInfo.id">
        <span style="font-size: 14px;color: var(--el-color-primary); text-decoration: underline;">{{ userInfo.name }}</span>
        &nbsp;
        [<span style="font-size: 12px; color: var(--el-color-error);" class="cursor" @click="logout">退出</span>]
      </template>
      <div class="layout-h layout-h-center" v-else>
        <span style="font-size: 14px;"  class="cursor" @click="openUserDialog('login')">请登录</span>
        &nbsp;
        [<span style="font-size: 12px; color: var(--el-color-info);" class="cursor" @click="openUserDialog('register')">未注册？</span>]
      </div>
    </div>
  </div>
  <luckySheet ref="luckySheetRef" :key="luckySheetKey" :fileCode="currentFileCode" :userInfo="userInfo" :showWatermark="showWatermark"  />
  <User v-model="userVisible" v-if="userVisible" :type="userType" @loginSuccess="loginSuccess"  />
  <CodeDialog v-model="codeVisible" v-if="codeVisible" :fileInfo="currentFile" :type="userType" @commit="commitCode" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import{ ElMessageBox, ElMessage }  from 'element-plus'
import { HomeFilled } from '@element-plus/icons-vue'
import { useRoute} from 'vue-router'

import luckySheet from '@/components/LuckySheet/index.vue'
import User from '@/components/User/index.vue'
import CodeDialog from '@/components/CodeDialog/index.vue'

import { getEacelBaseInfo, checkOpenCode, isShareUser, addSharer } from '@/api/index'
import Helper from '@/utils/helper'

const dataModel = new Helper()
const route = useRoute()

const luckySheetRef = ref(null)
const diffKey = ref('')

const userVisible = ref(false)
const userType = ref('login')
const userInfo = dataModel.userInfo

const showWatermark = ref(false)
const codeVisible = ref(false)

/* 当前选中的表格 */
const currentFileCode = ref('')
/* 当前选中文件信息 */
const currentFile = ref({})

/* luckySheetKey 发生变动时，luckySheet会重载  */
const luckySheetKey = computed(() => {
  return currentFile.value.code + diffKey.value
})

/* 打开用户登录/注册 */
const openUserDialog = (type = 'login') => {
  userType.value = type
  userVisible.value = true
}

/* 退出登录 */
const logout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    cancelButtonText: '取消',
    confirmButtonText: '退出',
  }).then(() => {
    dataModel.handleLogout()
  })
}

/* 分享链接 */
const shareUrl = () => {
  dataModel.shareUrl(currentFile.value.code, currentFile.value.fileType)
}

const goHome = () => {
  window.location.href = '/'
}

/* 去除水印， 重载LuckySheet */
const reloadLuckySheet = (code = null) => {
  currentFileCode.value =  code ?? currentFile.value.code
  showWatermark.value = false
  diffKey.value = Date.now()
}

/* 提交开放码/ 共享码 */
const commitCode = (value = '') => {
  /* 开放类型 */
  if(currentFile.value.fileType === 2) {
    const rex = /^\d{6}$/
    if (!rex.test(value)) {
      ElMessage.error('请输入6位数字开放码， 不含空格')
      return false
    }
    checkOpenCode({ openCode: value, code: currentFile.value.code }).then(res => {
      /* 校验通过 */
      if (res.data === 0)  {
        ElMessage.success('开放码校验成功')
        currentFileCode.value = currentFile.value.code
        /* 缓存 */
        window.localStorage.setItem(`${currentFile.value.code}`, value)
        reloadLuckySheet()
        codeVisible.value = false
        return false
      }
      /* 校验不通过 */
      const tip = res.data === 1 ? '当前开放码已失效' : '开放码错误'
      ElMessage.error(tip)
    })
  }

  /* 共享类型 */
  if (currentFile.value.fileType === 0) {
    const rex = /^\d{6}$/
    if (!rex.test(value)) {
      ElMessage.error('请输入6位数字共享码， 不含空格')
      return false
    }
    addSharer({ code: currentFile.value.code, userId: userInfo.value.id, shareCode: value }).then(res => {
      if (res.data === currentFile.value.code) {
        codeVisible.value = false
        reloadLuckySheet()
        ElMessage.success('恭喜你成为本文件共享者')
      }
    })
  }
}

/* 共享文件 登录/输入共享码 */
const hanldeFileTypeIs0 = async () => {
  if (currentFile.value?.fileType !== 0)  return false
  showWatermark.value = true
  currentFileCode.value = currentFile.value.code 
  if(userInfo.value.id) {
    const res = await isShareUser({ code: currentFile.value.code, userId: userInfo.value.id })
    /* 不是共享者 */
    if (res.data === 0) {
      codeVisible.value = true
      return false
    }
    /* 共享者 */
    if (res.data === 1) {
      reloadLuckySheet()
      return false
    }
    /* 拥有者 */
    if (res.data === 2) {
      ElMessage.error('您是文件的拥有者， 即将返回系统首页')
      setTimeout(() => {
        window.location.href = `/index?fileCode=${ currentFile.value.code}`
      }, 2000)
    }
  }
}

/* 私有文件类型 */
const handleFileTypeIs1 = () => {
 /* 私有文件 */
 if (currentFile.value?.fileType === 1) {
    const tip = `${currentFile.value?.name}为私有文件，不对外公开，请返回首页`
    ElMessageBox.alert(tip, '提示', {
      confirmButtonText: '去首页',
      callback: () => {
        window.location.href = '/'
      }
    })
    return false
  }
}
/* 开放文件类型 */
const handleFileTypeIs2 = async () => {
  /* 开放文件类型 */
  if (currentFile.value?.fileType === 2) {
    /* 获取缓存openCode */
    const oldOpenCode = window.localStorage.getItem(`${currentFile.value.code}`)
    if (oldOpenCode) {
      /* 自动校验 */
      const res = await checkOpenCode({ openCode: oldOpenCode, code: currentFile.value.code, userId: userInfo.value?.id ?? null })
      /* 校验通过 */
      if (res.data === 0)  {
        reloadLuckySheet()
        return false
      }
      if (res.data === 3) {
        ElMessage.error('您是文件的拥有者， 即将返回系统首页')
        setTimeout(() => {
          window.location.href = `/index?fileCode=${ currentFile.value.code}`
        }, 2000)
        return false
      }
      /* 不通过， 显示弹窗, 水印 */
      showWatermark.value = true
      codeVisible.value = true
      /* 加载文件 */
      currentFileCode.value = currentFile.value.code
    } else {
      /* 直接显示弹窗， 水印*/
      codeVisible.value = true
      showWatermark.value = true
      /* 加载文件 */
      currentFileCode.value = currentFile.value.code
    }
  }
}

/* 下载 */
const handleDownLoad = () => {
  luckySheetRef.value?.downloadExcel()
}

/* 初始 */
const init = async () => {
  const { code } = route.query
  /* 获取用户信息 */
  dataModel.initUserInfo()

  if (!code) {
    /* 返回首页 */
    window.location.href = '/'
    return false
  }
  /* 获取文件信息 */
  try {
    const res = await getEacelBaseInfo({ code })
    currentFile.value = res.data
    /* 处理不同类型文件 */
    hanldeFileTypeIs0()
    handleFileTypeIs1()
    handleFileTypeIs2()
  } catch (error) {
    console.log(error)
  }

}

/* 登录/注册成功成功 */
const loginSuccess = (data = {}) => {
  dataModel.handleLogin(data)
  if (currentFile.value?.fileType === 0) {
    hanldeFileTypeIs0()
  }
}

init()

</script>

<style scoped lang="scss">
.home-head-warp {
  height: 35px;
  width: 100%;
  background-color: #f1f1f1;
  font-size: 12px;
  color: #666;
  padding: 0 20px;
}
.act {
  color: var(--el-color-primary);
}
</style>
