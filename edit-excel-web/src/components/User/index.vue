<template>
  <el-dialog
    :before-close="handleClose"
    :width="600"
    append-to-body
    custom-class="cost-config-dialog"
    :title="type === 'login' ? '登录' : '注册'"
    v-model="state.visible"
  >
    <div class="dialog-container">
      <el-form :form="loginForm" v-if="type === 'login'">
        <el-form-item label="账号" prop="password">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入登录手机号码"
            clearable
            v-model.trim="loginForm.account"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入密码"
            type="password"
            clearable
            v-model.trim="loginForm.password"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-form :form="registerForm" v-else>
        <el-form-item label="账号" prop="password">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入正确的手机号码"
            clearable
            v-model.trim="registerForm.account"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="password">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入用户名"
            show-word-limit
            maxlength="10"
            minlength="2"
            clearable
            v-model.trim="registerForm.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入6-12位密码"
            type="password"
            clearable
            v-model.trim="registerForm.password"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="buttons layout-h layout-center">
        <el-button @click="handleClose" class="custom-gray">取消</el-button>
        <el-button type="primary" @click="handleConfirm" class="custom">提交</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

import { userRegister, login, addExcel } from '@/api/index'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  type: {
    default: 'login',
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'loginSuccess'])

const loginForm = reactive({
  account: '',
  password: '',
})

const registerForm = reactive({
  account: '',
  password: '',
  name: ''
})

const state = reactive({
  visible: true
})

const handleClose = () => {
  emit('update:modelValue')
}

/* 提交 */
const handleConfirm = () => {
  if (props.type === 'login') {
    const regex = /^1[3-9]\d{9}$/
    if (!regex.test(loginForm.account)) {
      ElMessage.error('请输入正确的手机号码')
      return false
    }
    const len = loginForm.password?.length 
    if (!len) {
      ElMessage.error('请输入位密码')
      return false
    }

    login(loginForm).then(res => {
      emit('loginSuccess', res.data)
      ElMessage.success('登录成功')
      handleClose()
    })
  } else {

    const regex = /^1[3-9]\d{9}$/
    if (!regex.test(registerForm.account)) {
      ElMessage.error('请输入正确的手机号码')
      return false
    } 

    if (!registerForm.name) {
      ElMessage.error('请输入用户名')
      return false
    }
    
    const len = registerForm.password?.length 
    if (!len || len < 6 || len > 12) {
      ElMessage.error('请输入6-12位密码')
      return false
    } 

    userRegister(registerForm).then(res => {
      /* 注册成功后， 自动新增一个文件 */
      addExcel({
        name: '我的表格.xlsx',
        fileType: 1,
        userId: res.data.id
      }).then(res1 => {
        emit('loginSuccess', res.data)
        ElMessage.success('注册成功')
        handleClose()
      })
    })
  }
}
</script>
<style lang="scss" scoped>
.dialog-container {
  padding: 44px 50px 32px 60px;
  .buttons {
    margin-top: 51px;
  }
}
</style>
