import {
  CookieOptions,
  Request,
  Response,
} from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import moment from 'moment';
import { generateJWT } from '../common.chamber';
import { v1 as uuidv1 } from 'uuid';


const cookieOptions: CookieOptions = {
  httpOnly: false,
  path: `/`,
  // domain: process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 'https://rmw-modern-client.herokuapp.com' : undefined,
  sameSite: 'none',
  secure: true,
  // expires: 
};


export class UtilsService {
  static async get_xsrf_token(request: Request, response: Response) {
    const token = generateJWT(process.env.APP_SECRET);
    
    response.cookie('xsrf-token', token, cookieOptions as CookieOptions);
    return response.status(HttpStatusCode.OK).json({
      message: `new xsrf-token cookie sent.`,
      // xsrf_token: token,
    });
  }

  static async get_xsrf_token_pair(request: Request, response: Response) {
    const datetime = new Date().toISOString();
    const jwt = generateJWT(datetime);
    
    response.cookie('xsrf-token-a', datetime, cookieOptions as CookieOptions);
    response.cookie('xsrf-token-b', jwt, cookieOptions as CookieOptions);
    return response.status(HttpStatusCode.OK).json({
      message: `new xsrf-token cookies sent.`,
    });
  }

  static async get_google_maps_key(request: Request, response: Response) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return response.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        message: `Google maps instance/service is not available on this app right now; please try again later.`
      });
    }

    return response.status(HttpStatusCode.OK).json({
      data: key
    });
  }
}