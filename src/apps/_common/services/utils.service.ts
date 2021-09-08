import {
  Request,
  Response,
} from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import moment from 'moment';
import { v1 as uuidv1 } from 'uuid';


export class UtilsService {
  static async get_xsrf_token(request: Request, response: Response) {
    const uuid = uuidv1();
    response.cookie('xsrf-token', uuid, {
      httpOnly: false,
      path: `/`,
    });
    return response.status(HttpStatusCode.OK).json({
      message: `new xsrf-token cookie sent.`,
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