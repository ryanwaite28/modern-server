import { Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';

/* class decorator */
function staticImplements<T>() {
  return <U extends T>(constructor: U) => { constructor };
}

// https://levelup.gitconnected.com/start-writing-your-own-typescript-method-decorators-c921cdc3d1c1
export function CatchRequestHandlerError() {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const childFunction = descriptor.value;
    
    console.log({ target, key, descriptor, childFunction });

    descriptor.value = (...args: any[]) => {
      const request: Request = args[0];
      const response: Response = args[1];
      console.log(args);

      try {
        // @ts-ignore
        return childFunction.apply(this, args);
      } catch (error) {
        console.log(error);
        try {
          // @ts-ignore
          return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            message: `could not fulfill request; something went wrong...`,
            error,
          });
        } catch (error2) {
          console.log(error2);
        }
      }
    };

    return descriptor;
  }
}