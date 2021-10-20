import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  IModelValidator,
  IUser,
} from '../interfaces/common.interface';
import * as CommonRepo from '../repos/_common.repo';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { Includeable } from 'sequelize/types';
import { validateData } from '../common.chamber';



export interface ICreateCommonGenericModelChildrenCrudService {
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  parent_model_name: string,
  child_model_name: string,
  child_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  includes?: Includeable[],

  createValidators: IModelValidator[],
  updateValidators: IModelValidator[],
}

export interface ICommonGenericModelChildrenCrudService {
  get_model_by_id: (child_model_id: number) => ServiceMethodAsyncResults,
  get_models_count: (parent_id: number) => ServiceMethodAsyncResults,
  get_models_all: (parent_id: number) => ServiceMethodAsyncResults,
  get_models: (parent_id: number, child_id?: number) => ServiceMethodAsyncResults,
  create_model: (opts: {
    data: any,
    you: IUser,
    parent_model: IMyModel,
    ignoreNotification?: boolean
  }) => ServiceMethodAsyncResults,
  update_model: (opts: {
    data: any, 
    child_model_id: number
  }) => ServiceMethodAsyncResults,
  delete_model: (child_model_id: number) => ServiceMethodAsyncResults,
}



export function createCommonGenericModelChildrenCrudService(params: ICreateCommonGenericModelChildrenCrudService) {
  const parent_model_id_params_name = params.parent_model_name + '_id';

  // https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
  let Class: ICommonGenericModelChildrenCrudService;
  Class = class {
    /** Request Handlers */
  
    static async get_model_by_id(child_model_id: number) {
      const data = params.child_model.findOne({
        where: { id: child_model_id },
        include: params.includes,
      });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data
        }
      };
      return serviceMethodResults;
    }
  
    static async get_models_count(parent_id: number) {
      const child_models_count = await params.child_model.count({ where: { [parent_model_id_params_name]: parent_id } });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: child_models_count,
        }
      };
      return serviceMethodResults;
    }
  
    static async get_models_all(parent_id: number) {
      const models = await CommonRepo.getAll(
        params.child_model,
        parent_model_id_params_name,
        parent_id,
        params.includes,
      );
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: models,
        }
      };
      return serviceMethodResults;
    }
  
    static async get_models(parent_id: number, child_id?: number) {
      const models = await CommonRepo.paginateTable(
        params.child_model,
        parent_model_id_params_name,
        parent_id,
        child_id,
        params.includes
      );
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: models,
        }
      };
      return serviceMethodResults;
    }
  
    static async create_model(opts: {
      data: any,
      you: IUser,
      parent_model: IMyModel,
      ignoreNotification?: boolean,
    }) {
      const { data, you, parent_model, ignoreNotification } = opts;
      const createObj: any = {};

      const dataValidation = validateData({
        data, 
        validators: params.createValidators,
        mutateObj: createObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }
      
      const new_model = await params.child_model.create(createObj, { include: params.includes });
      // const model = await params.child_model.findOne({
      //   where: { id: new_model.get('id') },
      //   include: params.includes
      // });

      if (!ignoreNotification) {
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
              data: new_model,
              message: `New ${params.child_model_name}`,
              user: you,
              notification,
            }
          });
        });
      }

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `created successfully`,
          data: new_model
        }
      };
      return serviceMethodResults;
    }
  
    static async update_model(opts: {
      data: any,
      child_model_id: number
    }) {
      const { data, child_model_id } = opts;
      const updatesObj: any = {};

      const dataValidation = validateData({
        data, 
        validators: params.updateValidators,
        mutateObj: updatesObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }

      const updates = await params.child_model.update(updatesObj, { where: { id: child_model_id } });
      const updated_model = await params.child_model.findOne({
        where: { id: child_model_id },
        include: params.includes,
      });

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `updated successfully`,
          data: {
            updates,
            [params.child_model_name]: updated_model
          }
        }
      };
      return serviceMethodResults;
    }
  
    static async delete_model(child_model_id: number) {
      const deletes = await params.child_model.destroy({ where: { id: child_model_id } });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: deletes,
        }
      };
      return serviceMethodResults;
    }

  };

  return Class;
}