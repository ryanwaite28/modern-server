import { NextFunction, Request, Response } from 'express';
import { Users } from '../models/user.model';
import { AuthorizeJWT, user_attrs_med } from '../chamber';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { get_user_by_id } from '../repos/users.repo';

export async function UserExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user_id = parseInt(request.params.user_id, 10);
  const user = await get_user_by_id(user_id);
  if (!user) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `User does not exist by id: ${user_id}`
    });
  }
  response.locals.user = user;
  return next();
}

export function UserAuthorized(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request);
  if (auth.error) {
    return response.status(auth.status).json(auth);
  }
  response.locals.you = auth.you;
  return next();
}

export function UserAuthorizedSlim(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, false);
  if (auth.error) {
    return response.status(auth.status).json(auth);
  }
  response.locals.you = auth.you;
  return next();
}

export function UserIdsAreDifferent(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const user_id = parseInt(request.params.user_id, 10);
  if (user_id === you_id) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `user_id and you_id cannot be the same`
    });
  }
  return next();
}

export async function UserIdsAreDifferentWithModel(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const user_id = parseInt(request.params.user_id, 10);
  if (user_id === you_id) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `user_id and you_id cannot be the same`
    });
  }
  const user_model = await Users.findOne({
    where: { id: user_id },
    attributes: user_attrs_med
  });
  response.locals.user = user_model && user_model.toJSON();
  return next();
}