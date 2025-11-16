// src/controllers/faqController.ts
import { Request, Response } from "express";
import { createFAQ, getFAQById, bulkUploadFAQs } from "../services/faqService";
import { sendResponse } from "../utils/responseHandler";

export const uploadFAQ = async (req: Request, res: Response) => {
  try {
    const { title, content, category, language } = req.body;
    const faq = await createFAQ(title, content, category, language);
    sendResponse(res, 200, "FAQ uploaded and translated", faq);
  } catch (err: any) {
    sendResponse(res, 500, "FAQ upload failed", err.message || String(err));
  }
};

export const getFAQ = async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    const lang = req.query.lang as string | undefined;
    const faq = await getFAQById(id, lang);
    sendResponse(res, 200, "FAQ fetched", faq);
  } catch (err: any) {
    sendResponse(res, 500, "Failed to fetch FAQ", err.message || String(err));
  }
};

export const uploadFAQs = async (req: Request, res: Response) => {
  try {
    const { faqs } = req.body;
    const result = await bulkUploadFAQs(faqs);
    sendResponse(res, 200, "FAQs uploaded successfully", result);
  } catch (err: any) {
    sendResponse(res, 500, "Failed to upload FAQs", err.message || String(err));
  }
};
import FAQ from "../models/FAQ";
import FAQTranslation from "../models/FAQTranslation";

export const getAllFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await FAQ.find({});
    const translations = await FAQTranslation.find({});

    const mapped = faqs.map((faq) => {
      const faqTrans = translations.filter((t) => String(t.faqId) === String(faq._id));

      const translationObj: any = {
        en: {
          question: faq.title,
          answer: faq.content,
        },
      };

      faqTrans.forEach((t) => {
        translationObj[t.language] = {
          question: t.translatedText,
          answer: t.translatedText,
        };
      });

      return {
        id: faq._id,
        category: faq.category || "general",
        translations: translationObj,
      };
    });

    sendResponse(res, 200, "All FAQs fetched", mapped);
  } catch (err: any) {
    sendResponse(res, 500, "Failed to fetch FAQs", err.message);
  }
};
