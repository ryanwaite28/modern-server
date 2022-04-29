import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IUser } from '../interfaces/common.interface';
import { get_api_key, get_user_by_id } from '../repos/users.repo';



export async function ApiKeyAuthorized(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const api_key = request.header('api-key');
  if (!api_key) {
    return response.status(HttpStatusCode.BAD_REQUEST).json({
      message: `No "api-key" header found on request`
    });
  }

  const api_key_model = await get_api_key(api_key);
  if (!api_key_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `No api-key exists by the given key`
    });
  }

  if (!api_key_model.user_id) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `No user account is associated to the given api-key. Please associate a user account to the key`
    });
  }

  if (!!api_key_model.user && !api_key_model.user!.stripe_account_verified) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `No user account is not ready/setup with stripe.`
    });
  }

  // const user = await get_user_by_id(api_key_model.user_id);
  // response.locals.user = user;

  response.locals.api_key = api_key;
  response.locals.api_key_model = api_key_model;

  const you: IUser = (await get_user_by_id(api_key_model.user_id))!;
  response.locals.you = you;

  return next();
}