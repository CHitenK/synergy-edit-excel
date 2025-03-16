const mongoose = require("mongoose");
const { createExcelConfigSchema, createExcelDataSchema, createUserSchema } = require("./dbSchemas.js");
const { mongodbUrl } = require('../config.js')

class DBHelper {
  /* 数据库 */
  db = null;
  /*  是否开始连接   */
  isStart = false;

  shareDBServer = null;
  /*  Mongo数据库连接地址   myname/12345678910cmk */
  dbUrl = mongodbUrl;

  /* 数据模型 */
  cofigSchema = null;

  dataSchema = null;
  
  userSchema
  constructor() {
    this.startConnect();
  }

  startConnect() {
    if (!this.dbUrl) return false;
    /* 防止多次连接 */
    if (!this.db && !this.isStart) {
      console.log(
        "-------------------------------开始连接数据库-------------------------"
      );
      this.isStart = true;
      this.connectDB();
    }
  }

  connectDB() {
    mongoose.connect(this.dbUrl);

    mongoose.connection.on("connected", () => {
      console.log("------------连接数据库成功---------");
      this.db = mongoose;
      this.initDbSchema()
    });
    /**
     * 连接异常 error 数据库连接错误
     */
    mongoose.connection.on("error", (err) => {
      console.log("连接数据库出错: " + err);
      this.db = null;
    });
    /**
     * 连接断开 disconnected 连接异常断开
     */
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose connection disconnected");
      this.db = null;
    });
  }

  initDbSchema() {
    if (!this.userSchema) {
      this.cofigSchema =  createExcelConfigSchema(this.db)
      this.dataSchema =  createExcelDataSchema(this.db)
      this.userSchema =  createUserSchema(this.db)
    }
  }
}

const helper = new DBHelper()

module.exports = helper