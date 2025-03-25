# Excel 在线协同编辑

## 项目访问

[Excel协同编辑系统](http://blog.sixk.top)

[Excel协同编辑系统-demo]([http://sixk.top/excel-demo.html)

系统示意图
![图片](http://120.46.210.201/sources/image/excel-edit.png)


## 项目结构

前端：

- 前端框架： Vue3 + Element-Plus + Luckyexcel + exceljs

- 文件目录： edit-excel-web

后端：

- 后端框架： Koa2 + socket.io + Mongodb

- 文件目录： edit-excel-server


## 项目介绍

功能简述： 

-excel 在线协同编辑

-用户登录， 注册

-在线协同编辑， 实时同步， 支持多数Exel公式计算， 格式转换

-excel 文件导入，导出

业务特点：

- 支持多种文件编辑模式

-- 私有表格, 只有创建者具有该表格的编辑， 删除等权限, 私有表格可以转变成共享表格，开放表格 ， 该文件需要编辑人登录

-- 共享表格, 只要是该表格的共享者，就具有编辑的权限， 不包括删除和添加共享者的权限，该文件需要编辑人登录，适合小团队内部使用
       
-- 开放表格, 获得开放码的游客就具有编辑表格的权限， 该文件不需要编辑人登录， 游客也可以编辑，适合大团队使用， 减去登录，注册步骤


### 注意

Excel 在线协同编辑暂不支持图片， 视频， 音频等文件的编辑
