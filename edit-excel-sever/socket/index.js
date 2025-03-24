const http = require("http");
const WebSocket = require("ws");
const pako = require("pako");
const { throttle } = require('../utils/index.js')
const { upDateExcelBySocket }  = require('../controllers/index.js')

class SocketHelper {
  server = null;
  wss = null;
  /* socket 房间 一个文件code代表一个Room */
  socketRoom = {}
  /* 每个code 文件对应的最新数据 */
  lastDataMap = {}
  /* 数据模型 */
  excelCofigSchema = null;

  dataSchema = null;

  /* 更新定时器 */
  upDateTimer = null;

  constructor(parameters) {
  }
  /* 初始Wss */
  initWss(app) {
    if (app && !this.wss) {
      this.server = http.createServer(app.callback());
      this.wss = new WebSocket.Server({ server: this.server });
    }
  }

  /* 添加客户端  */
  addClient(ws, code) {
    this.socketRoom[code]?.clients.add(ws)
  }

  /* 根据每个Code 初始一个socket Room */
  createSocketRoom(code) {
    const setRoomInfo = () => {
      return {
        clients: new Set(), // 房间内的客户端
        updateQueue : [], // 待更新的数据队列
        isUpdating: false, // 是否正在更新数据
      }
    }
    if (!this.socketRoom[code]) {
      this.socketRoom[code] = setRoomInfo()
    }
  }

  initSocket() {
    this.wss.on("connection", (ws, req) => {
      /* 每个url的 code 代表同一文件 */
      const url = new URL(req.url, `ws://${req.headers.host}`);
      const code = url.searchParams.get("code") || "";
      const name = url.searchParams.get("name") || "";
      
      console.log("有新的客户端连接" + code, name);
      /* 在ws配置信息 */
      const username = url.searchParams.get("name")
      const userId = url.searchParams.get("usd")
      ws.username = username
      ws._pid = userId

      this.createSocketRoom(code)
      this.addClient(ws, code)
      ws.on("message", (message) => {
        
        /* 解压数据 */
        const data = this._unzip(message);
        if (data) {
          const tData = JSON.parse(data)
          /* 更新数据 */
          if (tData.t === "update") {
            /* 将数据推入队列 */
            this.socketRoom[code]?.updateQueue.push(tData)
            this.startUpDateTimer()
          } else {
            // 广播消息给所有连接的客户端
            this.socketRoom[code]?.clients?.forEach((client) => {
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
            })
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
      console.log("ws服务器错误:", error);
      this.socketRoom = {};
    });
  }

  /* 处理用户退出 */
  handleExit(ws, code, name) {
    console.log("用户:", name, "退出");
    this.socketRoom[code]?.clients?.forEach((client) => {
      /* 广播在线客户端  用户退出 */
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        if (client._pid !== ws._pid) {
          client.send(JSON.stringify({ message: "用户退出", id:  ws._pid }));
        }
      }
      /* 移除断开连接的客户端 */
      if (client.readyState === WebSocket.CLOSED) {
        this.socketRoom[code]?.clients.delete(client);
      }
    });
    // 从集合中移除断开连接的客户端
    this.socketRoom[code]?.clients.delete(ws);
    /* code 对应的客户端数量 0 */
    if (this.socketRoom[code]?.clients.size === 0) {
      /* 清除房间相关数据 */
      this.socketRoom[code] = null
      console.log('清空了----' + code + '--- 房间的数据')
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

  /* 更新数据 */
  async updateMongoData(code, target = {}) {
    await upDateExcelBySocket(code, target.configList, target.cellData)
    this.socketRoom[code].updateQueue = []
  }

  /* 更新定时器 */
   startUpDateTimer() {
    if (this.upDateTimer) {
      return false 
    }
    this.upDateTimer = setInterval(() => {
      let bl = false
      for (const code in this.socketRoom) {
        const room = this.socketRoom[code]
        const len = room.updateQueue?.length
        /* 存在队列有数据 */
        if (len > 0) {
          bl = true
        }
        if (len > 0) {
          const target = room.updateQueue[len - 1] // 最新数据
          this.updateMongoData(code, target)
        }
      }
      /* 清除 */
      if (!bl || Object.keys(this.socketRoom).length === 0) {
        console.log('清除更新任务定时器', bl)
        clearInterval(this.upDateTimer)
        this.upDateTimer = null
        return false 
      }
    }, 3600)
  }
}

const theSocket = new SocketHelper();

exports.socketHelper = theSocket;
