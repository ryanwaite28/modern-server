import { ExpressResponse, ServiceMethodResults } from "../../_common/types/common.types";
import { Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { UploadedFile } from 'express-fileupload';
import { CarMasterService } from "../services/car-master.service";
import { CatchRequestHandlerError } from "../../_common/decorators/common.decorator";


export class CarMasterRequestHandler {
  @CatchRequestHandlerError()
  static async create_mechanic_profile(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_profile(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_mechanic_by_id(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_mechanic_by_id(mechanic_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_mechanic_by_user_id(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_mechanic_by_user_id(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_service_request_by_id(request: Request, response: Response): ExpressResponse {
    const service_request_id: number = parseInt(request.params.service_request_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_service_request_by_id(service_request_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}