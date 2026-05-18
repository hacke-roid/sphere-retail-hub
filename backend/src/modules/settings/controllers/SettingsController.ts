import type { NextFunction, Request, Response } from "express";
import PlatformSettingModel from "../models/PlatformSetting";

class SettingsController {
  async pageData(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await PlatformSettingModel.find({}).sort({ key: 1 }).lean().exec();
      return res.status(200).json({
        success: true,
        page: {
          metrics: {
            totalSettings: settings.length,
          },
          settings,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await PlatformSettingModel.find({}).sort({ key: 1 }).lean().exec();
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      return next(error);
    }
  }

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await PlatformSettingModel.findOneAndUpdate(
        { key: req.params.key },
        { key: req.params.key, value: req.body.value },
        { new: true, upsert: true },
      )
        .lean()
        .exec();

      return res.status(200).json({ success: true, setting });
    } catch (error) {
      return next(error);
    }
  }
}

export default new SettingsController();
