// // routes/adminRoutes.ts
// import express from "express";
// import * as adminController from "../controllers/adminController";

// const router = express.Router();

// router.get("/stats", adminController.getDashboardStats);
// router.get("/stats/languages", adminController.getLanguages); // <-- required by frontend
// router.get("/reports", adminController.getReports);
// router.get("/reports/export", adminController.exportReports);
// router.get("/stats/language-usage", adminController.getLanguageUsage);
// router.get("/stats/weekly-activity", adminController.getWeeklyActivity);

// router.post("/add-language", adminController.addLanguage);
// router.post("/upload-faqs", adminController.uploadFAQs);

// export default router;

import express from "express";
import {
  getDashboardStats,
  getLanguages,
  getReports,
  exportReports,
  getLanguageUsage,
  getWeeklyActivity,
  addLanguage,
  uploadFAQs
} from "../controllers/adminController";

const router = express.Router();

// ----------- Dashboard Stats -----------
router.get("/stats", getDashboardStats);

// ----------- Languages -----------
router.get("/stats/languages", getLanguages);

// ----------- Reports -----------
router.get("/reports", getReports);
router.get("/reports/export", exportReports);

// ----------- Statistical charts -----------
router.get("/stats/language-usage", getLanguageUsage);
router.get("/stats/weekly-activity", getWeeklyActivity);

// ----------- Admin Actions -----------
router.post("/add-language", addLanguage);
router.post("/upload-faqs", uploadFAQs);

export default router;
