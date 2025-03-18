<template>
  <div id="luckysheet"></div>
  <el-watermark v-if="showWatermark" :font="{ color: 'rgba(0, 0, 0, .35)' }" :content="['~仅可查看~']" :rotate="-10" :gap="[200, 200]" :zIndex="99">
    <div style="height: 100vh;"></div>
  </el-watermark>
  <div v-show="isMaskShow" id="tip">正在加载中...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineExpose, nextTick, onUnmounted } from 'vue'
// import LuckyExcel from 'luckyexcel'

import { commitExcelConfig, commitExcelCelldata, getEacelBaseInfo } from '@/api/index'

import { exportExcel } from '@/utils/export'
import { debounce, randomNum } from '@/utils/index'
import { getSheetConfig } from './useConfig'
import { socketBaseUrl } from '@/config_custom'
 
const props = defineProps({
  /* 文件code */
  fileCode: {
    default: ''
  },
  /* 用户信息 */
  userInfo: {
    default: {}
  },
  /* 是否显示水印 */
  showWatermark: {
    default: false
  }
})

const wsBaseUrl = import.meta.env.MODE === 'production' ? socketBaseUrl : 'ws://localhost:3011'

const emit = defineEmits(['renderComplete'])
/* socket */
let luckysheetSocket = null
/* 压缩函数 */
let luckysheetPakoZipData = null
/* 文件名 */
let fileName = '我的表格'

/* 命名游客 */
let freeuserName = localStorage.getItem('freeuserName')
if (!freeuserName) {
  freeuserName = '游客_' + randomNum(4)
  localStorage.setItem('freeuserName', freeuserName)
}

/* 基础配置 */
const sheetOpitions = {
  container: 'luckysheet',
  lang: 'zh',
  showinfobar: false,
  allowUpdate: false,
  loadUrl: '/api/initSheet',
  updateUrl: '',
  column: 30, // 列数
  row: 60, // 行数
  // 设置行高
  defaultRowHeight: 26, // 可以根据需要调整行高
  // 设置列宽
  defaultColWidth: 100, // 可以根据需要调整列宽
}

const isMaskShow = ref(false)

const downloadExcel = () => {
  exportExcel(luckysheet?.getAllSheets(), fileName)
}
/* 处理要提交的数据 */
const handleLuckySheetData = (luckySheelAllData = []) => {
  const configArr = []
  const shellArr = []
  const sheelConfigOrigin = getSheetConfig()
  luckySheelAllData.forEach((sheel, index) => {
    shellArr[index] = {
      name: sheel.name,
      data: sheel.celldata
    }
    configArr[index] = {}
    Object.keys(sheelConfigOrigin).forEach((key) => {
      if (key in sheel) {
        configArr[index][key] = sheel[key]
      }
    })
  })
  return {
    configList: configArr,
    cellData: shellArr
  }
}

/* 私有文件 用户 4s 内不再不进行操作就提交保存 http */
const commitUpdateTyle1 = debounce( () => {
  const data = luckysheet.getAllSheets()
  const { configList, cellData } = handleLuckySheetData(data)
  commitExcelConfig({
    code: props.fileCode,
    userId: props.userInfo.id,
    configList
  })

  commitExcelCelldata({
    code: props.fileCode,
    userId: props.userInfo.id,
    cellData
  })
  // f 
}, 4000)

/* 开放文件 发送 ws */
const commitUpdateTyle2 = () => {
  if (!luckysheetSocket) {
    luckysheetSocket = luckysheet.websocket ?? null
    luckysheetPakoZipData = luckysheet.pakoZipData ?? null
  }
  const data = luckysheet.getAllSheets()
  const { configList, cellData } = handleLuckySheetData(data)
   const d = {
    t: 'update',
    configList,
    cellData
  }
  let msg = luckysheetPakoZipData(d)
  luckysheetSocket.send(msg)
  // console.log('updated', data)
}
/* 渲染完成 */
const renderComplete = (data = {}) => {
  nextTick(() => {
    isMaskShow.value = false
    emit('renderComplete', data)
    luckysheetSocket = luckysheet.websocket ?? null
    luckysheetPakoZipData = luckysheet.pakoZipData ?? null
  })
}

/* 初始 */
const initLuckySheet = async () => {
  if (!props.fileCode) return false
  const res = await getEacelBaseInfo({ code: props.fileCode })
  const excelData = res.data
  const option = {
    ...sheetOpitions,
    title: excelData.name,
    gridKey: props.fileCode,
    hook: {}
  }
  if (excelData.fileType === 1) {
    option.hook.updated = commitUpdateTyle1
  }
  fileName = excelData.name
  /* 共享、开发 文件 无水印（可编辑情况下） */
  if (!props.showWatermark && (excelData.fileType === 0 || excelData.fileType === 2)) {
    option.hook.updated = () => {
      commitUpdateTyle2()
    }
    option.allowUpdate = true
    const name = props.userInfo.name ?? freeuserName
    option.updateUrl = `${wsBaseUrl}?code=${excelData.code}&name=${name}&t=${Date.now()}`
  }
  luckysheet.create(option)
  renderComplete({ name: excelData.name, fileType: excelData.fileType, code: excelData.code })
}

/* 游客加载 */
const initNoLoginLuckySheet = () => {
  const option = {
    ...sheetOpitions,
    title: '我的表格',
    gridKey: '',
    data: [
      {
        name: "Cell",
        index: "sheet_01",
        order: 0,
        status: 1,
        celldata: [],
      },
    ]
  }
  luckysheet.create(option)
  renderComplete({ })
}

/* 加载Sheet */
const initLuckSheet = () => {
  isMaskShow.value = true
  window.luckysheet?.destroy()
  if (props.fileCode) {
    initLuckySheet()
  } else {
    initNoLoginLuckySheet()
  }
}

onMounted(() => {
  initLuckSheet()
})

onUnmounted(() => {
  window.luckysheet.destroy()
})

defineExpose({
  downloadExcel,
  commitUpdateTyle1
})
</script>

<style  scoped >
#luckysheet {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 40px;
  bottom: 0px;
}

#uploadBtn {
  font-size: 16px;
}

#tip {
  position: absolute;
  z-index: 1;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 40px;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>
