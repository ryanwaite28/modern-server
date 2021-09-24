import { NextFunction, Request, Response } from 'express';
import { Model } from 'sequelize/types';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel, MyModelStatic, MyModelStaticGeneric } from '../../_common/models/common.model-types';



export interface ICreateModelGuardParams {
  get_model_fn: (id: number) => Promise<IMyModel | null>;
  model_name: string;
  model_owner_field: string;
  request_param_id_name: string;
}

export function createModelRouteGuards <T = IMyModel> (params: ICreateModelGuardParams) {
  const ModelExists = async(
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const model_id = parseInt(request.params[params.request_param_id_name], 10);
    const model_model = await params.get_model_fn(model_id);
    if (!model_model) {
      return response.status(HttpStatusCode.NOT_FOUND).json({
        message: `${params.model_name} not found`
      });
    }
    response.locals[params.model_name + '_model'] = model_model;
    return next();
  }

  const IsModelOwner = async(
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const model_model = <IMyModel> response.locals[params.model_name + '_model'];
    const isOwner: boolean = response.locals.you.id === model_model.get(params.model_owner_field);
    if (!isOwner) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `Not ${params.model_name} owner`
      });
    }
    return next();
  }

  const IsNotModelOwner = async(
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const model_model = <IMyModel> response.locals[params.model_name + '_model'];
    const isOwner: boolean = response.locals.you.id === model_model.get(params.model_owner_field);
    if (isOwner) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `Is ${params.model_name} owner`
      });
    }
    return next();
  }

  return {
    existsGuard: ModelExists,
    isOwnerGuard: IsModelOwner,
    isNotOwnerGuard: IsNotModelOwner,
  };
}