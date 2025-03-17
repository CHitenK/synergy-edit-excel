<template>
  <el-dialog
    :before-close="handleClose"
    :width="600"
    append-to-body
    custom-class="cost-config-dialog"
    :title="fileInfo.fileType === 2 ? '校验开放码' : '成为文件共享者'"
    v-model="state.visible"
  >
    <div class="dialog-container">
      <el-form :form="fileForm" v-if="fileInfo.fileType === 2 ">
        <el-form-item label="开放码" prop="code">
            <el-input
              class="simulate-password"
              placeholder="请输入6位数字的开放码"
              clearable
              v-model.trim="fileForm.code"
            ></el-input>
          </el-form-item>
        <el-form-item label="温馨提示" prop="code">
          文件需要校验开发码通过后, 才可以编辑，如未获得开放码， 请联系[ {{ fileInfo?.name }} ]的文件所有者
        </el-form-item>
      </el-form>
      <el-form :form="fileForm" v-else>
        <el-form-item label="共享码" prop="code">
            <el-input
              class="simulate-password"
              placeholder="请输入6位数字的共享码"
              clearable
              v-model.trim="fileForm.code"
            ></el-input>
          </el-form-item>
        <el-form-item label="温馨提示" prop="code">
          文件需要校验共享码通过后, 即可成为文件共享者，如未获得共享码， 请联系[ {{ fileInfo?.name }} ]的文件所有者
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


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fileInfo: {
    default: {}
  }
})

const emit = defineEmits(['update:modelValue', 'commit', 'cancel'])

const fileForm = reactive({
  code: ''
})


const state = reactive({
  visible: true
})

/* 关闭/取消 */
const handleClose = () => {
  emit('cancel')
  emit('update:modelValue')
}

const handleConfirm = () => {
  if (!fileForm.code) {
    ElMessage.error('不能为空')
    return false
  }
  emit('commit', fileForm.code)
}

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
