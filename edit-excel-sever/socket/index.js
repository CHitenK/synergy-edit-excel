const http = require("http");
const WebSocket = require("ws");
const pako = require("pako");
const { throttle } = require('../utils/index.js')
const { upDateExcelBySocket }  = require('../controllers/index.js')

class SocketHelper {
  server = null;
  wss = null;
  /* 区分单个文件对应的socket 客户端集 */
  clientsMap = {};
  
  /* 每个code 文件对应的最新数据 */
  lastDataMap = {}
  
  /* 数据模型 */
  excelCofigSchema = null;

  dataSchema = null;

  constructor(parameters) {
  }
  /* 初始Wss */
  initWss(app) {
    if (app && !this.wss) {
      this.server = http.createServer(app.callback());
      this.wss = new WebSocket.Server({ server: this.server });
    }
  }
  initSocket() {
    this.wss.on("connection", (ws, req) => {
      /* 每个url的 code 代表同一文件 */
      const url = new URL(req.url, `ws://${req.headers.host}`);
      const code = url.searchParams.get("code") || "";
      const name = url.searchParams.get("name") || "";
      
      console.log("有新的客户端连接" + code, name);

      if (!this.clientsMap[code]) {
        this.clientsMap[code] = new Set();
      }
      /* 在ws配置信息 */
      const username = url.searchParams.get("name")
      const userId = url.searchParams.get("usd")
      ws.username = username
      ws._pid = userId
      this.clientsMap[code].add(ws);
      ws.on("message", (message) => {
        /* 解压数据 */
        const data = this._unzip(message);
        if (data) {
          const tData = JSON.parse(data)
          /* 更新数据 */
          if (tData.t === "update") {
            this.lastDataMap[code] = data
            this.updateMongo(code)
          } else {
            // 广播消息给所有连接的客户端
            this.clientsMap[code].forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                let type = tData.t === "mv" ? 3 : 2
                const info = {
                  data,
                  id: ws._pid,
                  username: ws.username,
                  type
                };
                client.send( JSON.stringify(info));
              }
            });
          }  
        }
       });

      // 处理客户端断开连接事件
      ws.on("close", (clenet) => {
        // console.log(clenet === ws)
        this.handleExit(ws, code, name)
      });
    });
    this.wss.on("error", (error) => {
      console.error("服务器错误:", error);
      this.clientsMap = {};
    });
  }

  /* 处理用户退出 */
  handleExit(ws, code, name) {
    console.log("用户:", name, "退出");
    this.clientsMap[code].forEach((client) => {
      /* 广播在线客户端  用户退出 */
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        if (client._pid !== ws._pid) {
          client.send(JSON.stringify({ message: "用户退出", id:  ws._pid }));
        }
      }
      /* 移除断开连接的客户端 */
      if (client.readyState === WebSocket.CLOSED) {
        this.clientsMap[code].delete(client);
      }
    });
    // 从集合中移除断开连接的客户端
    this.clientsMap[code].delete(ws);
    /* code 对应的客户端数量 0 */
    if (this.clientsMap[code].size === 0) {
      delete this.clientsMap[code]
      delete this.lastDataMap[code]
      console.log('清空了----' + code + '---链接客户端')
    }
  }
  /* 解压数据 */
  _unzip(str = "") {
    const chartData = str
      .toString()
      .split("")
      .map((i) => i.charCodeAt(0));
      /* 排除客户端发送短消息防止断连 不处理 */
    if (chartData.length < 6) {
      return "";
    }
    /* 分割叔 */
    function uint16ArrayToString(uint16Array) {
      const chunkSize = 10000; // 每块的大小
      let result = '';
      for (let i = 0; i < uint16Array.length; i += chunkSize) {
          const chunk = uint16Array.subarray(i, i + chunkSize);
          result += String.fromCharCode.apply(null, chunk);
      }
      return result;
    }
  
    const binData = new Uint8Array(chartData);

    const data = pako.inflate(binData);
    const datStr = uint16ArrayToString(new Uint16Array(data));
    return decodeURIComponent(
      datStr
    );
  }
  /* 每4秒保存一次 */
  updateMongo = throttle((code) => {
    if (this.lastDataMap[code]) {
      const target = JSON.parse(this.lastDataMap[code])
      upDateExcelBySocket(code, target.configList, target.cellData)
    }
  }, 4000)
  /* 处理更新 */
  handleUpdateData = throttle((code) => {
    /* 当前有客户端连接code */
   const codes = Object.keys(this.clientsMap)
   if (codes.includes(code)) {
     
   }
  }, 2000)
}

const theSocket = new SocketHelper();

exports.socketHelper = theSocket;
