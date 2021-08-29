import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { get_resource_by_id } from '../repos/resources.repo';

export async function ResourceExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const resource_id = parseInt(request.params.resource_id, 10);
  const resource_model = await get_resource_by_id(resource_id);
  if (!resource_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Resource not found`
    });
  }
  response.locals.resource_model = resource_model;
  return next();
}

export async function IsResourceOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const resource_model = response.locals.resource_model;
  if (!resource_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Resource not found`
    });
  }
  const isNotOwner = parseInt(resource_model.get('owner_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the resource owner`
    });
  }

  return next();
}

export async function IsNotResourceOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const resource_model = response.locals.resource_model;
  if (!resource_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Resource not found`
    });
  }
  const isOwner = parseInt(resource_model.get('owner_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action on a resource that they own`
    });
  }

  return next();
}