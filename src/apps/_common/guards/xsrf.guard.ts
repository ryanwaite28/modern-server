import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';



export async function XSRF_PROTECTED(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const xsrf_token_cookie = request.cookies[`xsrf-token`];
  if (!xsrf_token_cookie) {
    return response.status(HttpStatusCode.BAD_REQUEST).json({
      message: `xsrf-token cookie not found on request.`
    });
  }

  const x_xsrf_token_header = request.headers[`x-xsrf-token`];
  if (!x_xsrf_token_header) {
    return response.status(HttpStatusCode.BAD_REQUEST).json({
      message: `x-xsrf-token header not found on request.`
    });
  }

  const match = xsrf_token_cookie === x_xsrf_token_header;
  if (!match) {
    return response.status(HttpStatusCode.BAD_REQUEST).json({
      message: `xsrf-token cookie and x-xsrf-token header does not match.`
    });
  }

  return next();
}