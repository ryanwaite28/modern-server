import { Router } from 'express';
import { UserAuthorized, UserExists } from '../guards/user.guard';
import { ICommonGenericModelChildrenCrudService } from './create-model-children-crud-service.helper';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
  IModelGuards,
} from './create-model-guards.helper';




export interface ICreateCommonGenericModelChildrenCrudRouter {
  child_model_name: string,
  makeGuard?: boolean,
  childModelGuardsOpts: IModelGuards | ICreateModelGuardParams,
  childModelCrudService: ICommonGenericModelChildrenCrudService,
}

export function createCommonGenericModelChildrenCrudRouter (params: ICreateCommonGenericModelChildrenCrudRouter) {
  const ChildModelCrudRouter: Router = Router({ mergeParams: true });

  const routeGuards: IModelGuards = params.makeGuard
    ? createModelRouteGuards(params.childModelGuardsOpts as ICreateModelGuardParams)
    : params.childModelGuardsOpts as IModelGuards;

  // GET Routes
  ChildModelCrudRouter.get(`/count`, params.childModelCrudService.get_models_count);
  ChildModelCrudRouter.get(`/all`, params.childModelCrudService.get_models_all);
  ChildModelCrudRouter.get(`/`, params.childModelCrudService.get_models);
  ChildModelCrudRouter.get(`/:${params.child_model_name}_id`, routeGuards.existsGuard, params.childModelCrudService.get_models);
  

  // POST Routes
  ChildModelCrudRouter.post(`/owner/:you_id`, UserAuthorized, params.childModelCrudService.create_model);
  

  // PUT Routes
  ChildModelCrudRouter.put(`/:${params.child_model_name}_id/owner/:you_id`, UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.childModelCrudService.update_model);
  
  
  // DELETE Routes
  ChildModelCrudRouter.delete(`/:${params.child_model_name}_id/owner/:you_id`, UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.childModelCrudService.delete_model);
  


  return ChildModelCrudRouter;
}