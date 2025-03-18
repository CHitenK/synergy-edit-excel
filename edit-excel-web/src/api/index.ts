import request from '@/utils/request'

/* 新增文件 */
export const addExcelFile = (params = {}) => {
  return request({
    url: '/api/addFile',
    method: "post",
    data: params
  })
}

/* 注册 */
export const userRegister = (params = {}) => {
  return request({
    url: '/api/register',
    method: "post",
    data: params
  })
}

/* 登录 */
export const login = (params = {}) => {
  return request({
    url: '/api/login',
    method: "post",
    data: params
  })
}


/* 新建文件 */
export const addExcel = (params = {}) => {
  return request({
    url: '/api/excel/add',
    method: "post",
    data: params
  })
}


/* 获取属于当前用户的文件列表 */
export const getFileList = (params = {}) => {
  return request({
    url: '/api/excel/fileList',
    method: "get",
    params
  })
}

/* 编辑文件名称、类型 */
export const uodateExcel = (params = {}) => {
  return request({
    url: '/api/excel/update',
    method: "post",
    data: params
  })
}

/* 删除 */
export const deleteExcel = (params = {}) => {
  return request({
    url: '/api/excel/delete',
    method: "delete",
    data: params
  })
}

/* 更新config 配置数据 */
export const commitExcelConfig = (params = {}) => {
  return request({
    url: '/api/excel/configUpdate',
    method: "post",
    data: params
  })
}

/* 更新cellDaa数据 */
export const commitExcelCelldata = (params = {}) => {
  return request({
    url: '/api/excel/celldataUpdate',
    method: "post",
    data: params
  })
}


/* 获取excel 基本信息 */
export const getEacelBaseInfo = (params = {}) => {
  return request({
    url: '/api/excel/baseInfo',
    method: "get",
    params
  })
}

/* 校验开放码 */
export const checkOpenCode = (params = {}) => {
  return request({
    url: '/api/excel/checkOpenCode',
    method: "post",
    data: params
  })
}

/* 根据userId 判断其是否是文件的共享者 */
export const isShareUser = (params = {}) => { 
  return request({
    url: '/api/excel/isSharer',
    method: "post",
    data: params
  }) 
}

/* 添加共享者 */
export const addSharer = (params = {}) => { 
  return request({
    url: '/api/excel/addSharer',
    method: "post",
    data: params
  }) 
}

/* 导入数据 */
export const importExcel = (params = {}) => { 
  return request({
    url: '/api/excel/importExcel',
    headers: {
      "Content-Type": "application/octet-stream"
    },
    method: "post",
    data: params
  }) 
}

