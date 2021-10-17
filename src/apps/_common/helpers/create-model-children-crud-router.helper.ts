import { Router } from 'express';
import { YouAuthorized } from '../guards/user.guard';
import { ICommonGenericModelChildrenCrudRequestHandler } from './create-model-children-crud-request-handler.helper';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
  IModelGuards,
} from './create-model-guards.helper';



export interface ICreateCommonGenericModelChildrenCrudRouter {
  child_model_name: string,
  makeGuard?: boolean,
  childModelGuardsOpts: IModelGuards | ICreateModelGuardParams,
  childModelCrudRequestHandler: ICommonGenericModelChildrenCrudRequestHandler,
}

export function createCommonGenericModelChildrenCrudRouter (params: ICreateCommonGenericModelChildrenCrudRouter) {
  const ChildModelCrudRouter: Router = Router({ mergeParams: true });

  const routeGuards: IModelGuards = params.makeGuard
    ? createModelRouteGuards(params.childModelGuardsOpts as ICreateModelGuardParams)
    : params.childModelGuardsOpts as IModelGuards;

  // GET Routes
  ChildModelCrudRouter.get(`/count`, params.childModelCrudRequestHandler.get_models_count);
  ChildModelCrudRouter.get(`/all`, params.childModelCrudRequestHandler.get_models_all);
  ChildModelCrudRouter.get(`/`, params.childModelCrudRequestHandler.get_models);
  ChildModelCrudRouter.get(`/:${params.child_model_name}_id`, routeGuards.existsGuard, params.childModelCrudRequestHandler.get_models);
  

  // POST Routes
  ChildModelCrudRouter.post(`/owner/:you_id`, YouAuthorized, params.childModelCrudRequestHandler.create_model);
  

  // PUT Routes
  ChildModelCrudRouter.put(`/:${params.child_model_name}_id/owner/:you_id`, YouAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.childModelCrudRequestHandler.update_model);
  
  
  // DELETE Routes
  ChildModelCrudRouter.delete(`/:${params.child_model_name}_id/owner/:you_id`, YouAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.childModelCrudRequestHandler.delete_model);
  


  return ChildModelCrudRouter;
}