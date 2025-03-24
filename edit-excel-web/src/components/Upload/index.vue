<template>
  <!-- 导入数据按钮 -->
  <div class="upload-warp">
    <input id="uploadBtn" accept=".xlsx" :key="fileKey" type="file" @change="loadExcel" />
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref } from 'vue'
import { ElMessage } from "element-plus";
import pako from 'pako';

import { importExcel } from '@/api/index'

import LuckyExcel from 'luckyexcel'


const props = defineProps({
  userId: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['uploadSuccess'])
const fileKey = ref(Date.now())

/* 处理导入 */
const loadExcel = (evt) => {
  const files = evt.target.files
  if (files == null || files.length == 0) {
    ElMessage.error('请导入文件')
    return
  }
  if (files[0].size > 1024 * 1024 * 1) {
    ElMessage.error('文件大小不能超过1M')
    return
  }
  let name = files[0].name
  let suffixArr = name.split('.'),
    suffix = suffixArr[suffixArr.length - 1]
  if (suffix != 'xlsx') {
    ElMessage.error('请导入.xlsx文件, 不支持其他格式文件')
    return
  }

  LuckyExcel.transformExcelToLucky(files[0], async function (exportJson, luckysheetfile) {
  
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      ElMessage.error('导入出错了，稍后重试')
      return false
    }
    /* 用户信息 */
    exportJson.userId = props.userId

    // 将数据转换为 JSON 字符串
    const jsonData = JSON.stringify(exportJson);
    // 使用 pako 进行压缩
    const compressedData = pako.gzip(jsonData);
    try {
      const res = await importExcel(compressedData)
      const { code } = res?.data
      emit('uploadSuccess', code)
    } catch (error) {
      console.log(error)
    }
    fileKey.value = Date.now()
  })
}

/* 点击上传按钮 */
const uploadBtnClick = () => {
  document.getElementById('uploadBtn')?.click() 
}

defineExpose({
  uploadBtnClick
})

</script>

<style scoped lang="scss">
.upload-warp {
  height: 1px;
  overflow: hidden;
  padding-top: 10px;
}
</style>