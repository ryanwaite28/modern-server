import { Router } from 'express';
import {
  YouAuthorized,
  UserExists
} from '../guards/user.guard';
import { IGenericModelCrudService } from './create-model-crud-service.helper';
import { createModelRouteGuards, ICreateModelGuardParams, IModelGuards } from './create-model-guards.helper';



export interface ICreateCommonGenericModelCrudRouter {
  makeGuard?: boolean,
  model_name: string,
  routeGuardsOpts: IModelGuards | ICreateModelGuardParams,
  modelCrudService: IGenericModelCrudService,
}

export function createCommonGenericModelCrudRouter(params: ICreateCommonGenericModelCrudRouter) {
  const model_id_field = params.model_name + `_id`;

  const routeGuards: IModelGuards = params.makeGuard
    ? createModelRouteGuards(params.routeGuardsOpts as ICreateModelGuardParams)
    : params.routeGuardsOpts as IModelGuards;

  const CrudRouter: Router = Router({ mergeParams: true });


  // GET Routes
  CrudRouter.get(`/:${model_id_field}`, routeGuards.existsGuard, params.modelCrudService.get_model_by_id);


  // POST Routes
  CrudRouter.post(`/owner/:you_id`, YouAuthorized, params.modelCrudService.create_model);


  // PUT Routes
  CrudRouter.put(`/:${model_id_field}/owner/:you_id`, YouAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.modelCrudService.update_model);


  // DELETE Routes
  CrudRouter.delete(`/:${model_id_field}/owner/:you_id`, YouAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.modelCrudService.delete_model);


  return CrudRouter;
}