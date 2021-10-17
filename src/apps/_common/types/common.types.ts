import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IModelValidator } from '../interfaces/common.interface';

export type ExpressMiddlewareFn = (
  request: Request, 
  response: Response, 
  next: NextFunction
) => Promise<void | Response<any>>;

export type ExpressRouteEndHandler = (
  request: Request, 
  response: Response
) => Promise<Response<any>>;

export type ServiceMethodResult = {
  status: HttpStatusCode,
  error: boolean,
  info: {
    message?: string;
    data?: any;
  };
};

export type ServiceMethodAsyncResult = Promise<ServiceMethodResult>;

export type ModelValidators = IModelValidator[];