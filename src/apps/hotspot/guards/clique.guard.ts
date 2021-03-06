import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { get_is_clique_member } from '../repos/clique-members.repo';
import { get_clique_by_id } from '../repos/cliques.repo';

export async function CliqueExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const clique_id = parseInt(request.params.clique_id, 10);
  const clique_model = await get_clique_by_id(clique_id);
  if (!clique_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Clique not found`
    });
  }
  response.locals.clique_model = clique_model;
  return next();
}

export async function IsCliqueCreator(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const clique_model = response.locals.clique_model;

  const isNotOwner = parseInt(clique_model.get('creator_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the clique owner`
    });
  }

  return next();
}

export async function IsNotCliqueCreator(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const clique_model = response.locals.clique_model;

  const isOwner = parseInt(clique_model.get('creator_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action on clique that they created`
    });
  }

  return next();
}

export async function IsCliqueMember(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user_id = parseInt(request.params.user_id, 10);
  const clique_id = parseInt(request.params.clique_id, 10);

  const is_member = await get_is_clique_member(clique_id, user_id);
  if (!is_member) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User is not a member`
    });
  }

  return next();
}

export async function IsNotCliqueMember(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user_id = parseInt(request.params.user_id, 10);
  const clique_id = parseInt(request.params.clique_id, 10);
  
  const is_member = await get_is_clique_member(clique_id, user_id);
  if (is_member) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User is a member`,
    });
  }

  return next();
}