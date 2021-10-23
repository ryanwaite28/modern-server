import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IModelValidator } from '../interfaces/common.interface';

export type ExpressMiddlewareFn = (
  request: Request, 
  response: Response, 
  next: NextFunction
) => Promise<void | Response<any>>;

export type ExpressResponse = Promise<Response<any>>;
export type ExpressRouteEndHandler = (
  request: Request, 
  response: Response
) => ExpressResponse;


/**
 * @interface ServiceMethodResults
 * 
 * @description
 * Interface for a service method return value.
 * - status: uses an http code to signify result of action
 * - error: flag to indicate if there was an error
 * - info: object that serves as details about the results
 */
export type ServiceMethodResults<T = any> = {
  status: HttpStatusCode,
  error: boolean,
  info: {
    message?: string;
    data?: T;
    error?: any;

    // [key:string]: any;
  };
};

export type ServiceMethodAsyncResults<T = any> = Promise<ServiceMethodResults<T>>;

export type ModelValidators = IModelValidator[];