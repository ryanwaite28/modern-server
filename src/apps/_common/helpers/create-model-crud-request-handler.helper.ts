import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import {
  IMyModel,
} from '../models/common.model-types';
import { ExpressRouteEndHandler } from '../types/common.types';
import { IGenericModelCrudService } from './create-model-crud-service.helper';



export interface ICreateCommonGenericModelCrudRequestHandler {
  model_name: string,
  crudService: IGenericModelCrudService,
}

export interface IGenericModelCrudRequestHandler {
  get_model_by_id: ExpressRouteEndHandler,
  get_models_all: ExpressRouteEndHandler,
  get_user_models: ExpressRouteEndHandler,
  create_model: ExpressRouteEndHandler,
  update_model: ExpressRouteEndHandler,
  delete_model: ExpressRouteEndHandler,
}

export function createCommonGenericModelCrudRequestHandler (params: ICreateCommonGenericModelCrudRequestHandler) {
  const model_field = params.model_name + '_model';
  const model_id_field = params.model_name + '_id';

  let Class: IGenericModelCrudRequestHandler;
  Class = class {
    static async get_model_by_id(request: Request, response: Response): ExpressResponse {
      const model = response.locals[model_field] as IMyModel;
      return response.status(HttpStatusCode.OK).json({
        data: model
      });
    }
  
    static async get_models_all(request: Request, response: Response): ExpressResponse {
      const user_id: number = parseInt(request.params.user_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.get_models_all(user_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_user_models(request: Request, response: Response): ExpressResponse {
      const user_id: number = parseInt(request.params.user_id, 10);
      const model_id = parseInt(request.params[model_id_field], 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.get_user_models(user_id, model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async create_model(request: Request, response: Response): ExpressResponse {
      const you: IUser = response.locals.you;
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.create_model({ you, data });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async update_model(request: Request, response: Response): ExpressResponse {
      const model = response.locals[model_field] as IMyModel;
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.update_model({ data, model });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async delete_model(request: Request, response: Response): ExpressResponse {
      const model_id = parseInt(request.params[model_id_field], 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.delete_model(model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  };

  return Class;
}