const Router = require("koa-router");

const {
  initSheetData,
  addExcel,
  register,
  login,
  findFileList,
  updateExcelNameOrType,
  deleteExcel,
  getExcelConfigData,
  getExcelCellData,
  saveCofigListByCode,
  savCelldataByCode,
  getExcelInfoByCode,
  checkOpenCode,
  isSharer,
  addSharer,
  importExcel
} = require("../controllers/index.js");

const router = new Router();

router.post("/api/register", register);
router.post("/api/login", login);
router.post("/api/initSheet", initSheetData);

/* 需要用户操作 */
router.post("/api/excel/add", addExcel);
router.get("/api/excel/fileList", findFileList);
router.post("/api/excel/update", updateExcelNameOrType);
router.delete("/api/excel/delete", deleteExcel);
router.post("/api/excel/config", getExcelConfigData);
router.post("/api/excel/celldata", getExcelCellData);
router.post("/api/excel/configUpdate", saveCofigListByCode);
router.post("/api/excel/celldataUpdate", savCelldataByCode);
router.get("/api/excel/baseInfo", getExcelInfoByCode);
router.post("/api/excel/checkOpenCode", checkOpenCode)
router.post("/api/excel/isSharer", isSharer)
router.post("/api/excel/addSharer", addSharer)
router.post("/api/excel/importExcel", importExcel)

module.exports = router;
