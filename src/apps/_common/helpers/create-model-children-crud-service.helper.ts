import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  IModelValidator,
  IUser,
} from '../interfaces/common.interface';
import * as CommonRepo from '../repos/_common.repo';
import {
  user_attrs_slim
} from '../common.chamber';
import { Users } from '../models/user.model';
import { COMMON_REACTION_TYPES } from '../enums/common.enum';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ExpressRouteEndHandler } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';



export interface ICreateCommonGenericModelChildrenCrudService {
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  parent_model_name: string,
  child_model_name: string,
  child_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  createValidators: IModelValidator[],
  updateValidators: IModelValidator[],
  creationCallback?: (params: {
    model: IMyModel,
    you: IUser,
  }) => void;
}

export interface ICommonGenericModelChildrenCrudService {
  get_model_by_id: ExpressRouteEndHandler,
  get_models_count: ExpressRouteEndHandler,
  get_models_all: ExpressRouteEndHandler,
  get_models: ExpressRouteEndHandler,
  create_model: ExpressRouteEndHandler,
  update_model: ExpressRouteEndHandler,
  delete_model: ExpressRouteEndHandler,
}

export function createCommonGenericModelChildrenCrudService(params: ICreateCommonGenericModelChildrenCrudService) {
  const parent_model_field_name = params.child_model_name + '_model';
  const parent_model_id_params_name = params.child_model_name + '_id';

  const child_model_field_name = params.child_model_name + '_model';
  const child_model_id_params_name = params.child_model_name + '_id';

  return class {
    /** Request Handlers */
  
    static async get_model_by_id(request: Request, response: Response) {
      const child_model = response.locals[child_model_field_name];
      return response.status(HttpStatusCode.OK).json({
        data: child_model
      });
    }
  
    static async get_models_count(request: Request, response: Response) {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);
      const child_models_count = await params.child_model.count({ where: { [parent_model_id_params_name]: parent_model_id } });
      return response.status(HttpStatusCode.OK).json({
        data: child_models_count
      });
    }
  
    static async get_models_all(request: Request, response: Response) {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);
      const models = await CommonRepo.getAll(
        params.child_model,
        parent_model_id_params_name,
        parent_model_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: models
      });
    }
  
    static async get_models(request: Request, response: Response) {
      const parent_model_id: number = parseInt(request.params[parent_model_id_params_name], 10);
      const child_model_id: number = parseInt(request.params[child_model_id_params_name], 10);
      const models = await CommonRepo.paginateTable(
        params.child_model,
        parent_model_id_params_name,
        parent_model_id,
        child_model_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: models
      });
    }
  
    static async create_model(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      const model_id: number = parseInt(request.params.model_id, 10);
      const parent_model = response.locals[parent_model_field_name] as IMyModel;

      const createObj: any = {};
  

      for (const prop of params.createValidators) {
        if (!data.hasOwnProperty(prop.field)) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is required.`
          });
        }
        const isValid: boolean = prop.validator(data[prop.field]);
        if (!isValid) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is invalid.`
          });
        }

        createObj[prop.field] = data[prop.field];
      }

      
      const new_model = await params.child_model.create(createObj);
      const model = await params.child_model.findOne({
        where: { id: new_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });

      create_notification({
        from_id: you.id,
        to_id: parent_model.get('owner_id'),
        micro_app: params.micro_app,
        event: params.create_model_event,
        target_type: params.target_type,
        target_id: new_model.get('id'),
      }).then(async (notification_model) => {
        const notification = await params.populate_notification_fn(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: parent_model.get('owner_id'),
          event: params.create_model_event,
          data: {
            data: model,
            message: `New ${params.child_model_name}`,
            user: you,
            notification,
          }
        });
      });

      return response.status(HttpStatusCode.OK).json({
        message: `created successfully`,
        data: model
      });
    }
  
    static async update_model(request: Request, response: Response) {
      const child_model = response.locals[child_model_field_name] as IMyModel;
      const child_model_id = child_model.get('id');
      const data: any = request.body.payload ? JSON.parse(request.body.payload) : request.body;
      const you: IUser = response.locals.you; 
      
      const updatesObj: any = {};

      for (const prop of params.updateValidators) {
        if (!data.hasOwnProperty(prop.field)) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is required.`
          });
        }
        const isValid: boolean = prop.validator(data[prop.field]);
        if (!isValid) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is invalid.`
          });
        }

        updatesObj[prop.field] = data[prop.field];
      }

      const updates = await params.child_model.update(updatesObj, { where: { id: child_model_id } });
      const updated_model = await params.child_model.findOne({
        where: { id: child_model_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
      return response.status(HttpStatusCode.OK).json({
        message: `updated successfully`,
        updates: updates,
        data: updated_model
      });
    }
  
    static async delete_model(request: Request, response: Response) {
      const child_model = response.locals[child_model_field_name] as IMyModel;
      const deletes = await child_model.destroy();
      return response.status(HttpStatusCode.OK).json({
        message: `deleted successfully`,
        deletes
      });
    }
  } as ICommonGenericModelChildrenCrudService;
}