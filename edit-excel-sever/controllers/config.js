/**
 * @DESC 接口返回成功
 * @param {*} data 要返回的数据
 * */

function handleHttpSuccess(data = null) {
  return {
    code: 200,
    data,
    status: 'success',
    msg: '执行成功'
  }
}
 /**
 * @DESC 接口返回失败
 * @param {*} errorMsg 错误提示语言
 * 
 * */
  function handleHttpFail(errorMsg = '') {
    return {
      code: 500,
      status: 'fail',
      msg: '执行失败',
      errorMsg
    }
  }

  exports.handleHttpSuccess = handleHttpSuccess
  exports.handleHttpFail = handleHttpFail