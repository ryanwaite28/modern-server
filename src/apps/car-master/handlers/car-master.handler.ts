import { ExpressResponse, ServiceMethodResults } from "../../_common/types/common.types";
import { Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { UploadedFile } from 'express-fileupload';
import { CarMasterService } from "../services/car-master.service";
import { CatchRequestHandlerError } from "../../_common/decorators/common.decorator";
import { update_mechanic_fields } from "../car-master.chamber";
import { IMechanicServiceRequest, IMechanicServiceRequestOffer } from "../interfaces/car-master.interface";


export class CarMasterRequestHandler {
  // users

  static async get_user_service_requests_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_user_service_requests_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_service_requests(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const service_request_id: number | undefined = request.params.service_request_id ? parseInt(request.params.service_request_id, 10) : undefined;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_user_service_requests(user_id, service_request_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_mechanic_service_requests_all(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_mechanic_service_requests_all(mechanic_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  static async get_mechanic_service_requests(request: Request, response: Response): ExpressResponse {
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const service_request_id: number | undefined = request.params.service_request_id ? parseInt(request.params.service_request_id, 10) : undefined;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.get_mechanic_service_requests(mechanic_id, service_request_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  // mechanic service

  @CatchRequestHandlerError()
  static async create_service_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request_image = request.files && (<UploadedFile> request.files.service_request_image);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.create_service_request(you, JSON.parse(request.body.payload), service_request_image);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async update_service_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request_id: number = parseInt(request.params.service_request_id, 10);
    const service_request_image = request.files && (<UploadedFile> request.files.service_request_image);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.update_service_request(service_request_id, JSON.parse(request.body.payload), service_request_image);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  @CatchRequestHandlerError()
  static async delete_service_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request as IMechanicServiceRequest;
    const service_request_id: number = parseInt(request.params.service_request_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.delete_service_request(service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



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
    const you = response.locals.you as IUser;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.search_mechanics(request.body, you?.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async search_service_requests(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.search_service_requests(request.body, you?.id);
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




  //  service requests

  @CatchRequestHandlerError()
  static async send_service_request_offer(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.send_service_request_offer(you, mechanic_id, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async cancel_service_request_offer(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const mechanic_id: number = parseInt(request.params.mechanic_id, 10);
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.cancel_service_request_offer(you, mechanic_id, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async accept_service_request_offer(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request_offer = response.locals.service_request_offer_model as IMechanicServiceRequestOffer;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.accept_service_request_offer(you, service_request_offer);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async decline_service_request_offer(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request_offer = response.locals.service_request_offer_model as IMechanicServiceRequestOffer;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.decline_service_request_offer(you, service_request_offer);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  @CatchRequestHandlerError()
  static async service_request_user_canceled(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.service_request_user_canceled(you.id, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async service_request_mechanic_canceled(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.service_request_mechanic_canceled(you.id, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  @CatchRequestHandlerError()
  static async send_service_request_message(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const options = {
      you_id: you.id,
      service_request,
      body: request.body.body as string,
    };
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.send_service_request_message(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async mark_service_request_as_work_started(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const options = {
      you_id: you.id,
      service_request,
    };
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.mark_service_request_as_work_started(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async mark_service_request_as_work_finished(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const options = {
      you_id: you.id,
      service_request,
    };
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.mark_service_request_as_work_finished(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async add_work_finished_picture(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const options = {
      you_id: you.id,
      service_request,
      work_finished_image: request.files && (<UploadedFile> request.files.work_finished_image),
    };
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.add_work_finished_picture(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  @CatchRequestHandlerError()
  static async pay_mechanic_via_transfer(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.pay_mechanic_via_transfer(you, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }


  @CatchRequestHandlerError()
  static async mechanic_self_pay(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const service_request = response.locals.service_request_model as IMechanicServiceRequest;
    const serviceMethodResults: ServiceMethodResults = await CarMasterService.mechanic_self_pay(you, service_request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }


}