import { NextFunction, Request, Response } from 'express';
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

export type ModelValidators = IModelValidator[];