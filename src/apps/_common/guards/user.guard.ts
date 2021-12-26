import { NextFunction, Request, Response } from 'express';
import { Users } from '../models/user.model';
import { AuthorizeJWT, user_attrs_med } from '../common.chamber';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { get_user_by_id } from '../repos/users.repo';
import { IUser } from '../interfaces/common.interface';

export async function YouExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const you_model = await get_user_by_id(you_id);
  if (!you_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `User does not exist by id: ${you_id}`
    });
  }
  response.locals.you_model = you_model;
  return next();
}

export async function UserExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user_id = parseInt(request.params.user_id, 10);
  const user_model = await get_user_by_id(user_id);
  if (!user_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `User does not exist by id: ${user_id}`
    });
  }
  response.locals.user_model = user_model;
  response.locals.user = user_model.toJSON();
  return next();
}

export function YouAuthorized(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, true);
  if (auth.error) {
    return response.status(auth.status).json(auth);
  }
  response.locals.you = auth.you;
  return next();
}
export function YouAuthorizedSlim(
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
export function YouAuthorizedSlimWeak(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, false);
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


export async function YouHasStripeConnect(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you = response.locals.you as IUser;
  if (!you.stripe_account_verified) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You do not have verified stripe account`
    });
  }
  return next();
}
export async function UserHasStripeConnect(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user = response.locals.user as IUser;
  if (!user.stripe_account_verified) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User does not have verified stripe account`
    });
  }
  return next();
}