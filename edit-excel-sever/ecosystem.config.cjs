
/*
  pm2 配置文件
  sehll 命令 pm2 start ./ecosystem.config.cjs
*/
module.exports = {
  apps: [
    {
      name: 'synergy-edit-excel-sever',
      port: '3011',
      exec_mode: 'cluster',
      instances: 1,
      script: './index.js'
    }
  ]
}
