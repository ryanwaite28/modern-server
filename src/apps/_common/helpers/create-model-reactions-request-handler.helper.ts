import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import {
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import { ExpressResponse, ExpressRouteEndHandler, ServiceMethodResults } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { IGenericModelReactionsService } from './create-model-reactions-service.helper';

export interface ICreateCommonGenericModelReactionsRequestHandler {
  base_model_name: string,
  reactionsService: IGenericModelReactionsService,
}

export interface IGenericModelReactionsRequestHandler {
  get_user_reaction: ExpressRouteEndHandler,
  toggle_user_reaction: ExpressRouteEndHandler,
  get_model_reactions_counts: ExpressRouteEndHandler,
  get_model_reactions_all: ExpressRouteEndHandler,
  get_model_reactions: ExpressRouteEndHandler,
}

export function createCommonGenericModelReactionsRequestHandler (
  params: ICreateCommonGenericModelReactionsRequestHandler
): IGenericModelReactionsRequestHandler {
  const model_field = params.base_model_name + '_model';
  const model_id_field = params.base_model_name + '_id';

  let Class: IGenericModelReactionsRequestHandler;
  Class = class {
    static async get_user_reaction(request: Request, response: Response): ExpressResponse {
      const user_id: number = parseInt(request.params.user_id, 10);
      const model_id: number = parseInt(request.params[model_id_field], 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.reactionsService.get_user_reaction(user_id, model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async toggle_user_reaction(request: Request, response: Response): ExpressResponse {
      const you: IUser = response.locals.you;
      const model = response.locals[model_field];
      const reaction = request.body.reaction;
      
      const serviceMethodResults: ServiceMethodResults = await params.reactionsService.toggle_user_reaction({ you, model, reaction });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_model_reactions_counts(request: Request, response: Response): ExpressResponse {
      const model_id: number = parseInt(request.params[model_id_field], 10);
  
      const serviceMethodResults: ServiceMethodResults = await params.reactionsService.get_model_reactions_counts(model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_model_reactions_all(request: Request, response: Response): ExpressResponse {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.reactionsService.get_model_reactions_all(model_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_model_reactions(request: Request, response: Response): ExpressResponse {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const reaction_id: number = parseInt(request.params.reaction_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.reactionsService.get_model_reactions(model_id, reaction_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  };

  return Class;
}