import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  IUser,
} from '../interfaces/common.interface';
import {
  IMyModel,
} from '../models/common.model-types';
import { ExpressRouteEndHandler } from '../types/common.types';
import { ICommonGenericModelChildrenCrudService } from './create-model-children-crud-service.helper';



export interface ICreateCommonGenericModelChildrenCrudRequestHandler {
  parent_model_name: string,
  child_model_name: string,
  crudService: ICommonGenericModelChildrenCrudService,
}

export interface ICommonGenericModelChildrenCrudRequestHandler {
  get_model_by_id: ExpressRouteEndHandler,
  get_models_count: ExpressRouteEndHandler,
  get_models_all: ExpressRouteEndHandler,
  get_models: ExpressRouteEndHandler,
  create_model: ExpressRouteEndHandler,
  update_model: ExpressRouteEndHandler,
  delete_model: ExpressRouteEndHandler,
}

export function createCommonGenericModelChildrenCrudRequestHandler(params: ICreateCommonGenericModelChildrenCrudRequestHandler) {
  const parent_model_field_name = params.child_model_name + '_model';
  const parent_model_id_params_name = params.child_model_name + '_id';

  const child_model_field_name = params.child_model_name + '_model';
  const child_model_id_params_name = params.child_model_name + '_id';

  let Class: ICommonGenericModelChildrenCrudRequestHandler;
  Class = class {
    /** Request Handlers */
  
    static async get_model_by_id(request: Request, response: Response): ExpressResponse {
      const child_model = response.locals[child_model_field_name];
      return response.status(HttpStatusCode.OK).json({
        data: child_model
      });
    }
  
    static async get_models_count(request: Request, response: Response): ExpressResponse {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);

      const serviceMethodResults: ServiceMethodResults = await params.crudService.get_models_count(parent_model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_models_all(request: Request, response: Response): ExpressResponse {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);

      const serviceMethodResults: ServiceMethodResults = await params.crudService.get_models_all(parent_model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_models(request: Request, response: Response): ExpressResponse {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);
      const child_model_id: number = parseInt(request.params[child_model_id_params_name], 10);

      const serviceMethodResults: ServiceMethodResults = await params.crudService.get_models(parent_model_id, child_model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async create_model(request: Request, response: Response): ExpressResponse {
      const you: IUser = response.locals.you;
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      const parent_model = response.locals[parent_model_field_name] as IMyModel;

      const serviceMethodResults: ServiceMethodResults = await params.crudService.create_model({ data, you, parent_model });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async update_model(request: Request, response: Response): ExpressResponse {
      const child_model = response.locals[child_model_field_name] as IMyModel;
      const child_model_id = child_model.get('id');
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      
      const serviceMethodResults: ServiceMethodResults = await params.crudService.update_model({ data, child_model_id });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async delete_model(request: Request, response: Response): ExpressResponse {
      const child_model = response.locals[child_model_field_name] as IMyModel;
      const child_model_id = child_model.get('id');

      const serviceMethodResults: ServiceMethodResults = await params.crudService.delete_model(child_model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  };

  return Class;
}