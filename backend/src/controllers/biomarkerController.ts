import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/errorHandler.js';
import prisma from '@config/prisma.js';
// import logger from '@config/logger.js'; // Assuming logger exists, if not we can use console

/**
 * Get weight history
 * GET /api/v1/biomarkers/weight/history
 */
export const getWeightHistoryController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.userId!;

        const history = await prisma.biomarkerRecord.findMany({
            where: {
                userId,
                weightKg: { not: null }
            },
            select: {
                id: true,
                weightKg: true,
                recordedAt: true,
                source: true
            },
            orderBy: { recordedAt: 'asc' },
            take: 30 // Last 30 entries
        });

        res.json({
            success: true,
            data: history
        });
    }
);

/**
 * Log new weight
 * POST /api/v1/biomarkers/weight
 */
export const logWeightController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.userId!;
        const { weightKg, date } = req.body;

        if (!weightKg) {
            res.status(400).json({ success: false, error: { message: 'Weight is required' } });
            return;
        }

        const recordDate = date ? new Date(date) : new Date();

        // 1. Create Biomarker Record
        const record = await prisma.biomarkerRecord.create({
            data: {
                userId,
                weightKg: Number(weightKg),
                recordedAt: recordDate,
                source: 'user_input'
            }
        });

        // 2. Update User Profile (Current Weight)
        await prisma.user.update({
            where: { id: userId },
            data: { currentWeightKg: Number(weightKg) }
        });

        res.status(201).json({
            success: true,
            data: record
        });
    }
);
