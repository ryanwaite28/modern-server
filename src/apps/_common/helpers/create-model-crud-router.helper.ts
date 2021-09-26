import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';
import { IGenericModelCrudService } from './create-model-crud-service.helper';
import { IModelGuards } from './create-model-guards.helper';



export interface ICreateCommonGenericModelCrudRouter {
  model_name: string,
  routeGuards: IModelGuards,
  modelCrudService: IGenericModelCrudService,
}

export function createCommonGenericModelCrudRouter(params: ICreateCommonGenericModelCrudRouter) {
  const model_id_field = params.model_name + `_id`;

  const CrudRouter: Router = Router({ mergeParams: true });


  // GET Routes
  CrudRouter.get(`/:${model_id_field}`, params.routeGuards.existsGuard, params.modelCrudService.get_model_by_id);


  // POST Routes
  CrudRouter.post(`/owner/:you_id`, UserAuthorized, params.modelCrudService.create_model);


  // PUT Routes
  CrudRouter.put(`/:${model_id_field}/owner/:you_id`, UserAuthorized, params.routeGuards.existsGuard, params.routeGuards.isOwnerGuard, params.modelCrudService.update_model);


  // DELETE Routes
  CrudRouter.delete(`/:${model_id_field}/owner/:you_id`, UserAuthorized, params.routeGuards.existsGuard, params.routeGuards.isOwnerGuard, params.modelCrudService.delete_model);
}