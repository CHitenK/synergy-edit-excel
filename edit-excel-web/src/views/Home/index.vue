<template>
  <div class="home-head-warp layout-h layout-space-between">
    <div class="layout-h layout-h-center" v-if="userInfo.id">
      <el-dropdown class="gutter-h"  trigger="click" >
        <div class="layout-h layout-h-center cursor" style="font-size: 12px;" >
          我的文件({{ userInfo.fileList?.length ?? 0 }})
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in userInfo.fileList" :key="item.code"  @click="choseFileMenu(item)">
              <span :class="item.code === currentFile.code ? 'act' : ''">{{ item.name }}&nbsp;[{{ ['共享', '私有', '开放'][item.fileType] }}]</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <template v-if="currentFile.code">
        <span>当前文件：</span>
        <div class="" style="font-size: 14px; color: var(--el-color-primary); text-decoration: underline;">
          {{ currentFile.name }} [{{ ['共享', '私有', '开放'][currentFile.fileType] }}]
        </div>
        &nbsp; &nbsp;
        <el-icon color="#666" :size="14"  class="gutter-h-small cursor" title="编辑" v-if="userInfo.id" @click="openEditFileDialog('edit')"><Edit /></el-icon>
        <el-icon color="#666" :size="14"  class="gutter-h-small cursor" title="手动保存" @click="handleSave"><DocumentChecked /></el-icon>
        <el-icon color="#666" :size="14"  class="gutter-hsmall cursor" title="删除" v-if="userInfo.fileList.length > 1" @click="deleteFile"><Delete /></el-icon>
      </template>
    </div>
    <div class="layout-h layout-h-center" style="font-size: 14px; color: var(--el-color-warning);" v-else>
      <span>注意: 现在是游客模式，编辑的数据不会保存！</span>
    </div>
    <div class="layout-h layout-h-center" v-if="userInfo.id">
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline;"  @click="openEditFileDialog('add')">新增表格</span>
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline; " @click="handleUpload">导入表格</span>
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline; " @click="shareUrl">分享链接</span>
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline;"  @click="copyCode" v-if="currentFile.fileType === 2">开放码</span>
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline;"  @click="copyCode" v-if="currentFile.fileType === 0">共享码</span>
      <span class="gutter-h cursor" style="font-size: 12px; text-decoration: underline;" @click="handleDownLoad">导出表格</span>
      <span style="font-size: 14px; color: var(--el-color-primary); ">{{ userInfo.name }}</span>
      &nbsp;
      [<span style="font-size: 12px; color: var(--el-color-error);" class="cursor" @click="logout">退出</span>]
    </div>
    <div class="layout-h layout-h-center" v-else>
      <span style="font-size: 14px;"  class="cursor" @click="openUserDialog('login')">请登录</span>
      &nbsp;
      [<span style="font-size: 12px; color: var(--el-color-info);" class="cursor" @click="openUserDialog('register')">未注册？</span>]
    </div>
  </div>
  <luckySheet ref="luckySheetRef" :key="currentFileCode" :fileCode="currentFileCode" :userInfo="userInfo"  />
  <EddFileDialog
    v-if="editFileVisible" 
    v-model="editFileVisible"
    :type="editFileType" 
    @handleSuccess="handleSuccess"
    :userId="userInfo.id" 
    :fileInfo="editFileType === 'edit' ? currentFile : {}"
    />
  <User v-model="userVisible" v-if="userVisible" :type="userType" @loginSuccess="loginSuccess"  />
  <Upload ref="uploadRef" :userId="userInfo.id" @uploadSuccess="handleSuccess('upload')" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import{ ElMessageBox, ElMessage }  from 'element-plus'
import { Delete, ArrowDown, Edit, DocumentChecked } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

import luckySheet from '@/components/LuckySheet/index.vue'
import EddFileDialog from '@/components/EddFileDialog/index.vue'
import User from '@/components/User/index.vue'
import Upload from '@/components/Upload/index.vue'

import { getFileList, deleteExcel } from '@/api/index'
import { copyText } from '@/utils/index'
import Helper from '@/utils/helper'

const dataModel = new Helper()
const route = useRoute()

const luckySheetRef = ref(null)
const uploadRef = ref(null)

const userVisible = ref(false)
const userType = ref('login')
const userInfo = dataModel.userInfo

const editFileType = ref('add')
const editFileVisible = ref(false)

/* 当前选中的表格 */
const currentFileCode = ref('')
/* 当前选中文件信息 */
const currentFile = computed(() => {
  return userInfo.value.fileList?.find(item => item.code === currentFileCode.value) ?? {}
})

/* 打开用户登录/注册 */
const openUserDialog = (type = 'login') => {
  userType.value = type
  userVisible.value = true
}

/* 打开编辑表格信息 */
const openEditFileDialog = (type = 'add') => {
  editFileType.value = type
  editFileVisible.value = true
}

/* 获取用户文件列表 */
const queryFileList = (callback = null) => {
  if (!userInfo.value.id) return false
  getFileList({ userId: userInfo.value.id }).then(res => {
    userInfo.value.fileList = res.data
    if (callback) {
      callback()
    }
  })
}

/* 选中文件 */
const choseFileMenu = (data) => {
  currentFileCode.value = data.code
  sessionStorage.setItem('currentFileCode', currentFileCode.value)
}

/* 处理文件操作成功 */
const handleSuccess = (type = 'edit') => {
  if (type === 'edit') { // 编辑成功， 更新
    queryFileList()
  } else {
    // 成功后， 设置第一个文件为当前文件
    queryFileList(() => {
      choseFileMenu(userInfo.value.fileList[0])
    })
  } 
}

/* 登录成功 */
const loginSuccess = (data = {}) => {
  dataModel.handleLogin(data)
}

/* 删除 */
const deleteFile = () => {
 ElMessageBox.confirm(`确定删除'${currentFile.value.name}'？`, '提示', {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
  }).then(() => {
    deleteExcel({ code: currentFile.value.code, userId: userInfo.value.id }).then(res => {
      ElMessage.success('删除成功')
      handleSuccess('delete')
    })
  })
}

/* 退出登录 */
const logout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    cancelButtonText: '取消',
    confirmButtonText: '退出',
  }).then(() => {
    sessionStorage.removeItem('currentFileCode')
    dataModel.handleLogout()
  })
}

/* 分享链接 */
const shareUrl = () => {
  dataModel.shareUrl(currentFile.value.code, currentFile.value.fileType)
}

/* 复制码 */
const copyCode = () => {
  const tcode = currentFile.value.fileType === 2 ? currentFile.value.openCode : currentFile.value.shareCode
  const message = `${currentFile.value.fileType === 2 ? '开放码' : '共享码'}已经复制到剪贴板`
  copyText(tcode, message)
}

/* 下载 */
const handleDownLoad = () => {
  luckySheetRef.value?.downloadExcel()
}

/* 手动保存 */
const handleSave = () => {
  luckySheetRef.value?.commitUpdateTyle1()
  ElMessage.success('文件保存成功')
}

/* 导入数据 */
const handleUpload = () => {
 uploadRef.value?.uploadBtnClick()
}

onMounted(() => {
  const { fileCode } = route.query
  dataModel.initUserInfo()
  if (userInfo.value.id) {
    queryFileList(() => {
      const scode = fileCode || sessionStorage.getItem('currentFileCode') ||  ''
      const t = userInfo.value.fileList?.find(item => item.code === scode)
      currentFileCode.value  = t ? t.code : userInfo.value.fileList[0]?.code
    })
  }
})
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
