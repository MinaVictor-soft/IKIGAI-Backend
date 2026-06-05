import { Response } from 'express';

export function sendSuccess(res: Response, data: unknown, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendCreated(res: Response, data: unknown) {
  sendSuccess(res, data, 201);
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  pagination: { page: number; limit: number; total: number }
) {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}
