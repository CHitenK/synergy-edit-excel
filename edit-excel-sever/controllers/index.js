const dbHelper = require("../mongodb/index.js");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const { handleHttpSuccess, handleHttpFail } = require("./config.js");
const dayjs = require("dayjs");

function randomNum(num = 2) {
  const n = Math.random() * 999;
  const n1 = n.toString().replace(/\./g, "");
  /* 截取4位字符 */
  return n1.substring(0, num);
}

/* 默认加载的表格数据 */
const getExcelDefaultData = (text = '开始编辑数据') => {
  const sheetData = [
    {
      name: "Cell",
      index: "sheet_01",
      order: 0,
      status: 1,
      celldata: [
        {
          r: 0,
          c: 0,
          v: { v: text, m: "111", ct: { fa: "General", t: "n" } },
        },
      ],
    },
  ]
  return sheetData; 
}
/* 通过Code 查询 config，cellData数据表是否存在code对应数据 */
async function findExcelDataByCode(findOpt = {}) {
  const res1 = await dbHelper.cofigSchema.findOne(findOpt);
  const res2 = await dbHelper.dataSchema.findOne(findOpt);
  return !!res1 && !!res2;
}

/* 新建表格 */
async function addExcel(content, next) {
  const params = content.request.body;
  const time = Date.now();

  const code = `${dayjs(time).format("HHmmssMMDD")}${randomNum(6)}`;

  /* 默认配置 */
  const configData = {
    id: uuidv4(),
    /* 创建时间 */
    creatTime: time,
    /* 所属文件code */
    code,
    /* 所属用户ID */
    hostUserId: params.userId,
    /* 名称 */
    name: params.name,
    /* 更新时间 */
    updateTime: time,
    /* 是否使用 */
    status: 1, // 1，是， 0 否
    /* 配置内容 */
    configList: [
      {
        name: "sheet1",
        index: "sheet_01",
        order: 0,
        status: 1,
        row: 60, //行数
        column: 30, //列数
        defaultRowHeight: 26, //自定义行高
        defaultColWidth: 100, //自定义列宽
      },
    ],
  };
  /* 默认空数据 */
  const cellData = {
    id: uuidv4(),
    /* 创建时间 */
    creatTime: time,
    /* 文件名 */
    name: params.name,
    /* 所属文件code */
    code,
    /* 所属用户ID */
    hostUserId: params.userId,
    /* 更新时间 */
    updateTime: time,
    /* 是否使用 */
    status: 1, // 1，是， 0 否
    /* 文件类型 私有/ 共享 / 开放  可修改 */
    fileType: params.fileType, // 1，私有， 0 共享 ，2 开放
    /* 共享者Id */
    sharerList: [],
    /* 有编辑权限的用户ID  共享文件具有 */
    canEditUserIds: [],
    /* 开放码 */
    openCode: params.openCode,
    /* 开放码过期时间 */
    openCodeExpireTime: params.openCodeExpireTime,
    /* 共享码 */
    shareCode: params.shareCode,
    /* 配置内容 */
    cellData: [],
  };

  /* 开始事务， 需保证数据被两个表插入 */
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    dbHelper.cofigSchema.create([configData], { session });
    dbHelper.dataSchema.create([cellData], { session });
    /* 提交事务 */
    await session.commitTransaction();
    session.endSession();
    content.response.body = handleHttpSuccess({ code, name: params.name });
  } catch (error) {
    console.log(error);
    // 回滚事务
    await session.abortTransaction();
    session.endSession();
    content.response.body = handleHttpFail();
    return false;
  }
}

/* 用户注册 */
async function register(content, next) {
  const params = content.request.body;
  const time = Date.now();
  const { name, account } = params;
  const res1 = await dbHelper.userSchema.find({ account });
  if (res1.length) {
    content.response.body = handleHttpFail("用户已存在");
    return false;
  }
  const res2 = await dbHelper.userSchema.find({ name });
  if (res2.length) {
    content.response.body = handleHttpFail("该用户名已存在");
    return false;
  }
  const date = dayjs(time).format("YYMMDDHHmmss");
  const userInfo = {
    ...params,
    creatTime: time,
    id: `${date}${randomNum()}`,
    fileList: [],
  };
  const dbCollection = new dbHelper.userSchema(userInfo);
  await dbCollection.save();

  delete userInfo.password;
  content.response.body = handleHttpSuccess(userInfo);
}

/* 用户登录 */
async function login(content, next) {
  const params = content.request.body;
  const { account, password } = params;
  const res = await dbHelper.userSchema.find({ account });

  if (res.length < 1) {
    content.response.body = handleHttpFail("用户未注册");
    return false;
  }

  const userInfo = res[0];
  if (userInfo.password !== password) {
    content.response.body = handleHttpFail("密码错误");
    return false;
  }

  delete userInfo.password;
  content.response.body = handleHttpSuccess(userInfo);
}

/* 查找用户文件列表 */
async function findFileList(content, next) {
  const params = content.request.query;
  const { userId } = params;
  const res = await dbHelper.dataSchema
    .find({ hostUserId: userId })
    .sort({ creatTime: -1 });
  const fileList = res?.map((item) => {
    return {
      name: item.name,
      code: item.code,
      fileType: item.fileType,
      openCode: item.openCode,
      openCodeExpireTime: item.openCodeExpireTime,
      shareCode: item.shareCode,
    };
  });
  content.response.body = handleHttpSuccess(fileList ?? []);
}

/* 修改表格名称，类型 */
async function updateExcelNameOrType(content, next) {
  const params = content.request.body;
  const { code, name, fileType, openCodeExpireTime, shareCode, openCode } =
    params;
  const res = await dbHelper.dataSchema.findOne({ code });
  const updateTime = Date.now();
  if (!res) {
    console.log("---updateExcelNameOrType--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  const upt = { name, fileType, updateTime };
  if (fileType === 2) {
    upt.openCode = openCode;
    upt.openCodeExpireTime = openCodeExpireTime;
  }
  if (fileType === 0) {
    upt.shareCode = shareCode;
    /* 如果更新了共享码， 清空共享者 */
    if (shareCode !== res.shareCode) {
      upt.sharerList = [];
    }
  }
  await dbHelper.cofigSchema.updateOne(
    { code },
    { $set: { name, updateTime } }
  );
  await dbHelper.dataSchema.updateOne({ code }, { $set: upt });
  content.response.body = handleHttpSuccess({ code, name, fileType });
}

/* 删除表格 */
async function deleteExcel(content, next) {
  const params = content.request.body;
  const { code, userId } = params;
  const bl = await findExcelDataByCode({ code, hostUserId: userId });
  if (!bl) {
    console.log("---deleteExcel--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  await dbHelper.cofigSchema.deleteOne({ code, hostUserId: userId });
  await dbHelper.dataSchema.deleteOne({ code, hostUserId: userId });
  content.response.body = handleHttpSuccess({ code });
}

/* 获取表格配置数据 */
async function getExcelConfigData(content, next) {
  const params = content.request.body;
  const { code } = params;
  const res1 = await dbHelper.cofigSchema.findOne({ code });
  if (!res1) {
    console.log("---getExcelConfigData--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  const data = {
    name: res1.name,
    code: res1.code,
    configList: res1.configList,
  };
  content.response.body = handleHttpSuccess(data);
}

/* 获取表格Cell数据 */
async function getExcelCellData(content, next) {
  const params = content.request.body;
  const { code } = params;
  const res1 = await dbHelper.dataSchema.findOne({ code });
  if (!res1) {
    console.log("---getExcelCellData--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  const data = {
    name: res1.name,
    code: res1.code,
    fileType: res1.fileType,
    cellData: res1.cellData,
  };
  content.response.body = handleHttpSuccess(data);
}

/* 初始化biaoge  */
async function initSheetData(content, next) {
  const { gridKey } = content.request.body;
  if (!gridKey) {
    const sheetData = getExcelDefaultData();
    const data = JSON.stringify(sheetData);
    content.response.body = data
  } else {
    const excelCofig = await dbHelper.cofigSchema.findOne({ code: gridKey });
    const excelData = await dbHelper.dataSchema.findOne({ code: gridKey });
    /* code 对应的数据不存在时 */
    if (excelCofig && excelData) {
      const sheetData = excelCofig?.configList?.map((item, index) => {
        const t = excelData.cellData?.find(cell => {
          return cell.name === item.name
        }) ?? {}
        return {
          ...item,
          celldata: t?.data ?? []
        }
      })
      const data = JSON.stringify(sheetData);
      content.response.body = data;
    } else {
      const sheetData = getExcelDefaultData(`文件${gridKey}对应数据不存在`);
      const data = JSON.stringify(sheetData);
      content.response.body = data
    }
  }
}
/* 更新表格配置信息 */
async function saveCofigListByCode(content, next) {
  const params = content.request.body;
  const { code, userId, configList } = params;
  const updateTime = Date.now();
  const res = await dbHelper.cofigSchema.updateOne(
    { code, hostUserId: userId },
    { $set: { configList, updateTime } }
  );
  if (!res) {
    console.log("---saveCofigListByCode--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  content.response.body = handleHttpSuccess();
}

/* 更新表格数据 */
async function savCelldataByCode(content, next) {
  const params = content.request.body;
  const { code, userId, cellData } = params;
  const updateTime = Date.now();
  const res = await dbHelper.dataSchema.updateOne(
    { code, hostUserId: userId },
    { $set: { cellData, updateTime } }
  );
  if (!res) {
    console.log("---savCelldataByCode--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  content.response.body = handleHttpSuccess();
}

/* 通过code 获取表格基础信息  */
async function getExcelInfoByCode(content, next) {
  const { code } = content.request.query;
  const res1 = await dbHelper.dataSchema.findOne({ code });
  if (!res1) {
    console.log("---getExcelCellData--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  const data = {
    name: res1.name,
    code: res1.code,
    fileType: res1.fileType,
    openCodeExpireTime: res1.openCodeExpireTime,
  };
  content.response.body = handleHttpSuccess(data);
}

/* 校验开放码 */
async function checkOpenCode(content, next) {
  const { code, openCode, userId } = content.request.body;
  const res = await dbHelper.dataSchema.findOne({ code });
  if (!res) {
    console.log("---checkOpenCode--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  /* 开放码已经失效 */
  if (res.openCodeExpireTime < Date.now()) {
    content.response.body = handleHttpSuccess(1);
    return false;
  }
  /* 文件所有者 */
  if (userId && userId === res.hostUserId) {
    content.response.body = handleHttpSuccess(3);
    return false;
  }
  if (res.openCode === openCode) {
    /* 匹配 */
    content.response.body = handleHttpSuccess(0);
    return false;
  } else {
    /* 开放码输入有误 */
    content.response.body = handleHttpSuccess(2);
  }
}

/* 判断当前userId 是否是共享者 */
async function isSharer(content, next) {
  const { code, userId } = content.request.body;
  const res = await dbHelper.dataSchema.findOne({ code });
  if (!res || res?.fileType !== 0) {
    console.log("---isSharer--- 未找到文件 ");
    content.response.body = handleHttpFail();
    return false;
  }
  const sharerList = res?.sharerList;

  let data = 0;
  /* 用户是分享者 */
  if (sharerList.includes(userId)) data = 1;
  /* 用户是所有者 */
  if (res.hostUserId === userId) data = 2;
  content.response.body = handleHttpSuccess(data);
}

/* 添加共享者 */
async function addSharer(content, next) {
  const { code, userId, shareCode } = content.request.body;
  const res = await dbHelper.dataSchema.findOne({ code, shareCode });
  if (!res) {
    content.response.body = handleHttpFail("共享码与文件不匹配");
    return false;
  }
  if (res?.sharerList?.length > 6) {
    content.response.body = handleHttpFail("共享用户已达6人上限");
    return false;
  }
  if (res?.sharerList.includes(userId)) {
    content.response.body = handleHttpSuccess("用户已添加");
    return false;
  }
  await dbHelper.dataSchema.updateOne(
    { code },
    { $push: { sharerList: userId } }
  );
  content.response.body = handleHttpSuccess(code);
}

/* ws 更新配置信息 */
 async function upDateExcelBySocket(code, configList, cellData ) {
 
  if (code && Array.isArray(configList)) {
    await dbHelper.cofigSchema.updateOne({ code }, { $set: { configList } });
  }
  if (code && Array.isArray(cellData)) {
    await dbHelper.dataSchema.updateOne({ code }, { $set: { cellData } });
  }
}

module.exports = {
  initSheetData,
  register,
  addExcel,
  login,
  findFileList,
  updateExcelNameOrType,
  deleteExcel,
  getExcelCellData,
  getExcelConfigData,
  saveCofigListByCode,
  savCelldataByCode,
  getExcelInfoByCode,
  checkOpenCode,
  isSharer,
  addSharer,
  upDateExcelBySocket
};
