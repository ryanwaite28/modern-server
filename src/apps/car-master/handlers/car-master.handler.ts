import { ExpressResponse, ServiceMethodResults } from "../../_common/types/common.types";
import { Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { UploadedFile } from 'express-fileupload';
import { CarMasterService } from "../services/car-master.service";
import { CatchRequestHandlerError } from "../../_common/decorators/common.decorator";
import { update_mechanic_fields } from "../car-master.chamber";


export class CarMasterRequestHandler {
  // mechanic profile

  @CatchRequestHandlerError()
  static async create_mechanic_profile(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_profile(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_mechanic_profile(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_mechanic_profile(mechanic_id, request.body);
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
  static async search_mechanics(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.search_mechanics(request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }


  
  // mechanic field
  
  @CatchRequestHandlerError()
  static async create_mechanic_field(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_field(mechanic_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_mechanic_field(request: Request, response: Response): ExpressResponse {
    const field_id: number = parseInt(request.params.field_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_mechanic_field(field_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async delete_mechanic_field(request: Request, response: Response): ExpressResponse {
    const field_id: number = parseInt(request.params.field_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.delete_mechanic_field(field_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  // mechanic credential

  @CatchRequestHandlerError()
  static async create_mechanic_credential(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const credential_image = request.files && (<UploadedFile> request.files.credential_image);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_credential(mechanic_id, JSON.parse(request.body.payload), credential_image);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_mechanic_credential(request: Request, response: Response): ExpressResponse {
    const credential_id: number = parseInt(request.params.credential_id, 10);
    const credential_image = request.files && (<UploadedFile> request.files.credential_image);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_mechanic_credential(credential_id, JSON.parse(request.body.payload), credential_image);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async delete_mechanic_credential(request: Request, response: Response): ExpressResponse {
    const credential_id: number = parseInt(request.params.credential_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.delete_mechanic_credential(credential_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  // mechanic expertise

  @CatchRequestHandlerError()
  static async create_mechanic_expertise(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_expertise(mechanic_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_mechanic_expertise(request: Request, response: Response): ExpressResponse {
    const expertise_id: number = parseInt(request.params.expertise_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_mechanic_expertise(expertise_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async delete_mechanic_expertise(request: Request, response: Response): ExpressResponse {
    const expertise_id: number = parseInt(request.params.expertise_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.delete_mechanic_expertise(expertise_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  


  // mechanic service

  @CatchRequestHandlerError()
  static async create_mechanic_service(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_service(mechanic_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_mechanic_service(request: Request, response: Response): ExpressResponse {
    const service_id: number = parseInt(request.params.service_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_mechanic_service(service_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async delete_mechanic_service(request: Request, response: Response): ExpressResponse {
    const service_id: number = parseInt(request.params.service_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.delete_mechanic_service(service_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  // mechanic rating

  @CatchRequestHandlerError()
  static async create_mechanic_rating(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_rating(mechanic_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async create_mechanic_rating_edit(request: Request, response: Response): ExpressResponse {
    const rating_id: number = parseInt(request.params.rating_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_mechanic_rating_edit(rating_id, request.body);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

}