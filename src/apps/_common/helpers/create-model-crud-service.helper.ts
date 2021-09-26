import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';
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
  allowedImages
} from '../../_common/common.chamber';
import { IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ExpressRouteEndHandler } from '../types/common.types';



export interface ICreateCommonGenericModelCrudService {
  model_name: string,
  model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  createValidators: IModelValidator[],
  updateValidators: IModelValidator[],
  creationCallback?: (params: {
    model: IMyModel,
    you: IUser,
  }) => void;
}

export interface IGenericModelCrudService {
  get_model_by_id: ExpressRouteEndHandler,
  get_models_all: ExpressRouteEndHandler,
  get_user_models: ExpressRouteEndHandler,
  create_model: ExpressRouteEndHandler,
  update_model: ExpressRouteEndHandler,
  delete_model: ExpressRouteEndHandler,
}

export function createCommonGenericModelCrudService (params: ICreateCommonGenericModelCrudService) {
  const model_id_field = params.model_name + '_id';

  return class {
    static async get_model_by_id(request: Request, response: Response) {
      const model = response.locals[params.model_name + '_model'] as IMyModel;
      return response.status(HttpStatusCode.OK).json({
        data: model
      });
    }
  
    static async get_models_all(request: Request, response: Response) {
      const user_id: number = parseInt(request.params.user_id, 10);
      const models = await CommonRepo.getAll(
        params.model,
        'owner_id',
        user_id,
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
  
    static async get_user_models(request: Request, response: Response) {
      const user_id: number = parseInt(request.params.user_id, 10);
      const model_id = parseInt(request.params.model_id, 10);
      const models = await CommonRepo.paginateTable(
        params.model,
        'owner_id',
        user_id,
        model_id,
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
      const data: PlainObject = JSON.parse(request.body.payload);
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
  
      const new_model = await params.model.create(data);
      

      if (params.creationCallback) {
        params.creationCallback({ model: new_model, you });
      }

      const model = await params.model.findOne({
        where: { id: new_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
  
      return response.status(HttpStatusCode.OK).json({
        message: `Post created successfully`,
        data: model
      });
    }
  
    static async update_model(request: Request, response: Response) {
      const model = response.locals[params.model_name + '_model'] as IMyModel;
      const model_id = model.get('id');
      const data = request.body;
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

      const updates = await model.update(updatesObj, { where: { id: model_id } });
      const updated_model = await params.model.findOne({
        where: { id: model_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
      return response.status(HttpStatusCode.OK).json({
        message: `Post updated successfully`,
        updates: updates,
        data: updated_model
      });
    }
  
    static async delete_model(request: Request, response: Response) {
      const model = response.locals[params.model_name + '_model'] as IMyModel;
      const deletes = await model.destroy();
      return response.status(HttpStatusCode.OK).json({
        message: `Post deleted successfully`,
        deletes
      });
    }
  } as IGenericModelCrudService;
}