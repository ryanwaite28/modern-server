import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import * as CommonRepo from '../../_common/repos/_common.repo';
import {
  IModelValidator,
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import {
  user_attrs_slim,
  allowedImages,
  validateData
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/common.types';
import { Includeable } from 'sequelize/types';



export interface ICreateCommonGenericModelCrudService {
  model_name: string,
  owner_field?: string,
  model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  createValidators: IModelValidator[],
  updateValidators: IModelValidator[],
  includes?: Includeable[],
  creationCallback?: (params: {
    model: IMyModel,
    you: IUser,
  }) => void;
}

export interface IGenericModelCrudService {
  get_model_by_id: (model_id: number) => ServiceMethodAsyncResults,
  get_models_all: (user_id: number) => ServiceMethodAsyncResults,
  get_user_models: (user_id: number, model_id: number) => ServiceMethodAsyncResults,
  create_model: (options: {
    you: IUser,
    data: any,
  }) => ServiceMethodAsyncResults,
  update_model: (options: {
    model: IMyModel,
    data: any,
  }) => ServiceMethodAsyncResults,
  delete_model: (model_id: number) => ServiceMethodAsyncResults,
}

export function createCommonGenericModelCrudService (
  params: ICreateCommonGenericModelCrudService
): IGenericModelCrudService {
  const owner_field_name = params.owner_field || 'owner';
  const owner_id_field_name = (params.owner_field && params.owner_field + '_id') || 'owner_id';

  const includes = params.includes || [{
    model: Users,
    as: owner_field_name,
    attributes: user_attrs_slim
  }];

  let Class: IGenericModelCrudService;
  Class = class {
    static async get_model_by_id(model_id: number) {
      const model = params.model.findOne({
        where: { id: model_id },
        include: includes,
      });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: model
        }
      };
      return serviceMethodResults;
    }
  
    static async get_models_all(user_id: number) {
      const models = await CommonRepo.getAll(
        params.model,
        owner_id_field_name,
        user_id,
        includes
      );
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: models
        }
      };
      return serviceMethodResults;
    }
  
    static async get_user_models(user_id: number, model_id: number) {
      const models = await CommonRepo.paginateTable(
        params.model,
        'owner_id',
        user_id,
        model_id,
        includes
      );
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: models
        }
      };
      return serviceMethodResults;
    }
  
    static async create_model(options: {
      you: IUser,
      data: any,
    }) {
      const { you, data } = options;
      const createObj: any = {};

      const dataValidation = validateData({
        data, 
        validators: params.createValidators,
        mutateObj: createObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }
  
      const new_model = await params.model.create(data);

      if (params.creationCallback) {
        params.creationCallback({ model: new_model, you });
      }

      const model = await params.model.findOne({
        where: { id: new_model.get('id') },
        include: includes
      });
  
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: model,
          message: `${params.model_name} created successfully`,
        }
      };
      return serviceMethodResults;
    }
  
    static async update_model(options: {
      model: IMyModel,
      data: any,
    }) {
      const { model, data } = options;
      const model_id = model.get('id');
      const updatesObj: any = {};

      const dataValidation = validateData({
        data, 
        validators: params.updateValidators,
        mutateObj: updatesObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }

      const updates = await model.update(updatesObj, { where: { id: model_id } });
      const updated_model = await params.model.findOne({
        where: { id: model_id },
        include: includes
      });

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `${params.model_name} updated successfully`,
          data: {
            updates,
            [params.model_name]: updated_model
          }
        }
      };
      return serviceMethodResults;
    }
  
    static async delete_model(model_id: number) {
      const deletes = await params.model.destroy({ where: { id: model_id } });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: deletes,
          message: `${params.model_name} deleted successfully`,
        }
      };
      return serviceMethodResults;
    }
  };

  return Class;
}