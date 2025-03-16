<template>
  <el-dialog
    :before-close="handleClose"
    :width="840"
    append-to-body
    custom-class="cost-config-dialog"
    :title="type === 'edit' ? '编辑表格信息' : '新增表格'"
    v-model="state.visible"
  >
    <div class="dialog-container">
      <el-form :form="fileForm">
        <el-form-item label="文件名" prop="name">
          <el-input
            class="simulate-password"
            ref="passwordRef"
            placeholder="请输入文件名"
            :maxlength="20"
            show-word-limit
            clearable
            v-model.trim="fileForm.name"
          ><template #append>.xlsx</template></el-input>
        </el-form-item>
        <el-form-item label="表格类型" prop="fileType">
          <el-radio-group v-model="fileForm.fileType" :disabled="state.oldFileType === 0 || state.oldFileType === 2"> 
            <el-radio :value="1">私有</el-radio>
            <el-radio :value="0">共享</el-radio>
            <el-radio :value="2">开放</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="fileForm.fileType === 2">
          <el-form-item label="开放码" prop="openCode">
            <span class="code-warp layout-h layout-center gutter-h-small">{{ fileForm.openCode }}</span> <el-text class="gutter-h-small cursor" type="primary" @click="fileForm.openCode = randomNum(6)">重新生成 </el-text>
            <el-text class="cursor" type="primary" @click="copyText(fileForm.openCode )">复制</el-text>
          </el-form-item>
          <el-form-item label="开放失效日期" prop="openCodeExpireTime">
            <el-date-picker
              v-model="fileForm.openCodeExpireTime"
              type="date"
              placeholder="失效日期"
            />
          </el-form-item>
        </template>  
        <template v-if="fileForm.fileType === 0">
          <el-form-item label="共享码" prop="">
            <span class="code-warp layout-h layout-center gutter-h-small">{{ fileForm.shareCode }}</span> <el-text class="gutter-h-small cursor" type="primary" @click="fileForm.shareCode = randomNum(6)">重新生成 </el-text>
            <el-text class="cursor gutter-h-small" type="primary" @click="copyText(fileForm.shareCode )">复制</el-text>
            <span style="color: #999;">注意：共享码修改成功，原共享者将被清除！</span>
          </el-form-item>
        </template>  
        <el-form-item label="类型解析" prop="fileType">
          <div>私有表格, 只有创建者具有该表格的编辑， 删除等权限, 私有表格可以转变成共享表格，开放表格 。</div>
          <div>共享表格, 只要是该表格的共享者，就具有编辑的权限， 不包括删除和添加共享者的权限。</div>
          <div>开放表格, 获得开放码的游客就具有编辑表格的权限。</div>
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
import dayjs from 'dayjs'

import { addExcel, uodateExcel } from '@/api/index'
import { randomNum } from '@/utils/index'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fileInfo: {
    default: {}
  },
  type: {
    default: 'add',
  },
  fileNames: {
    default: []
  },
  userId: {
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'handleSuccess'])

const fileForm = reactive({
  name: '',
  fileType: 1,
  openCodeExpireTime: dayjs().add(10, 'day'),
  shareCode: randomNum(6),
  openCode: randomNum(6)
})


const state = reactive({
  visible: true,
  oldFileType: null
})

/* 复制 */
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制到粘贴板');
  } catch (error) {
    ElMessage.error('复制出错了');
    console.log(error)
  }
}

const init = () => {
  const { name, fileType, shareCode, openCodeExpireTime, openCode  } = props.fileInfo ?? {}
  state.oldFileType = fileType
  
  fileForm.name = name? name.replace('.xlsx', '') : '' 
  fileForm.fileType = fileType ?? 1
  /* 共享类型 */
  if (fileType === 0) {
    fileForm.shareCode = shareCode
  }

  if (fileType === 2) {
    fileForm.openCodeExpireTime = openCodeExpireTime
    fileForm.openCode = openCode
  }

}


const handleClose = () => {
  emit('update:modelValue')
}

const handleConfirm = () => {
  if (!fileForm.name) {
    ElMessage.error('请输入文件名')
    return false
  }
  if (props.fileNames.includes(fileForm.name)) {
    ElMessage.error('文件名已存在')
    return false
  }

  const http = props.type === 'edit'? uodateExcel : addExcel
  const opt = {
    name: fileForm.name + '.xlsx',
    userId: props.userId,
    fileType: fileForm.fileType
  }

  if (props.type === 'edit') {
    opt.code = props.fileInfo.code
  }

  if (fileForm.fileType === 0) {
    opt.openCode = null
    opt.openCodeExpireTime = null
    opt.shareCode = fileForm.shareCode 
  }

  if (fileForm.fileType === 2) {
    opt.shareCode = null
    opt.openCode = fileForm.openCode
    opt.openCodeExpireTime = dayjs(fileForm.openCodeExpireTime).endOf('day').valueOf()
  }

  http(opt).then((res) => {
    ElMessage.success('操作成功')
    emit('handleSuccess', props.type)
    handleClose()
  })
}

init()
</script>
<style lang="scss" scoped>
.dialog-container {
  padding: 44px 50px 32px 60px;
  .buttons {
    margin-top: 51px;
  }
  .code-warp {
    width: 100px;
    height: 30px;
    font-size: 18px;
    background-color: #efefef;
    letter-spacing: 2px;
  }
}
</style>
