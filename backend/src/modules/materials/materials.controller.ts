import { Request, Response, NextFunction } from 'express';
import { materialsService } from './materials.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class MaterialsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const material = await materialsService.createMaterial(req.params.subjectId as string, req.body);
      sendSuccess(res, material, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await materialsService.listMaterials(req.params.subjectId as string);
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const material = await materialsService.getMaterial(req.params.materialId as string);
      sendSuccess(res, material);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await materialsService.deleteMaterial(req.params.materialId as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async ingestText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await materialsService.ingestMaterialText(
        req.params.materialId as string,
        req.body.rawText
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const results = await materialsService.similaritySearch(req.params.subjectId as string, req.body);
      sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  }

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await materialsService.uploadAndIngest(req.params.subjectId as string, {
        title: req.body.title || req.file?.originalname || 'Lecture Material',
        curriculumTopicId: req.body.curriculumTopicId,
        materialType: req.body.materialType,
        rawText: req.body.rawText,
        file: req.file,
      });
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const materialsController = new MaterialsController();
