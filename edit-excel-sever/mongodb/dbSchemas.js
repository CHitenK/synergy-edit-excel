
 /* 配置 mongodb 模型Schema */
  function createUserSchema(DB) {
   
    const Schema = DB.Schema;

    const tSchema = new Schema({
      id: { type: String },
      /* 创建时间 */
      creatTime: { type: Number },
      /* 名称 */
      name: { type: String },
      /* 账号 */
      account: { type: String },
      /* 密码 */
      password: { type: String },

      /* 文件表 */
      fileList: { type: Array }
    });

    const modelSchema = DB.model("user", tSchema);

    return modelSchema;
  }

  function createExcelConfigSchema (DB) {
    const Schema = DB.Schema;

    const tSchema = new Schema({
      id: { type: String },
      /* 创建时间 */
      creatTime: { type: Number },
      /* 文件名称 */
      name: { type: String },
      /* 所属文件code */
      code: { type: String },
      /* 所属用户ID */
      hostUserId: { type: String },
      /* 更新时间 */
      updateTime: { type: Number },
      /* 是否使用 */
      status: { type: Number }, // 1，是， 0 否
      /* 配置内容 */
      configList: { type: Array }
    });

    const modelSchema = DB.model("excel_config", tSchema);

    return modelSchema;
  }


  function createExcelDataSchema (DB) {
    const Schema = DB.Schema;

    const tSchema = new Schema({
      /* 创建时间 */
      creatTime: { type: Number },
      /* 所属code */
      code: { type: String },
      /* 文件名称 */
      name: { type: String },
      /* 所属用户ID */
      hostUserId: { type: String },
      /* 更新时间 */
      updateTime: { type: Number },
      /* 是否使用 */
      status: { type: Number }, // 1，是， 0 否
      /* 文件类型 私有/ 共享 / 开放  可修改 */
      fileType: { type: Number }, // 1，私有， 0 共享 ，2 开放
      /* 共享者Id */
      sharerList: { type: Array },
      /* 有编辑权限的用户ID  共享文件具有 */
      canEditUserId: { type: Array },
      /* 开放码 */
      openCode: { type: String },
      /* 开放码过期时间 */
      openCodeExpireTime: { type: Number },
      /* 共享码 */
      shareCode: { type: String },
      /* 文件内容 */
      cellData: { type: Array }
    });

    const modelSchema = DB.model("excel_data", tSchema);

    return modelSchema;
  }

  module.exports = {
    createUserSchema,
    createExcelConfigSchema,
    createExcelDataSchema
  }