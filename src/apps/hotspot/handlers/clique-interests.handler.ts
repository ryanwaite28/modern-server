import { Request, Response } from 'express';

import {
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';

import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';
import * as CliqueInterestsRepo from '../repos/clique-interests.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { fn, col, cast, Op } from 'sequelize';
import { create_notification } from '../../_common/repos/notifications.repo';
import { CliqueInterests, Cliques, CliqueMembers } from '../models/clique.model';
import { Users } from '../../_common/models/user.model';
import {
  HOTSPOT_EVENT_TYPES,
  HOTSPOT_NOTIFICATION_TARGET_TYPES
} from '../enums/hotspot.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { IMyModel } from '../../_common/models/common.model-types';



export class CliqueInterestsRequestHandler {
  static async get_user_clique_interests(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const interest_id = parseInt(request.params.interest_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.get_user_clique_interests(user_id, interest_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_clique_interests_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.get_user_clique_interests_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_clique_interests_all(request: Request, response: Response): ExpressResponse {
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.get_clique_interests_all(clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_clique_interests(request: Request, response: Response): ExpressResponse {
    const clique_id: number = parseInt(request.params.clique_id, 10);
    const interest_id: number = parseInt(request.params.interest_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.get_clique_interests(clique_id, interest_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async check_interest(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.check_interest(you_id, clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async check_membership(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const clique_id: number = parseInt(request.params.clique_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.check_membership(you_id, clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async show_interest(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const clique_model = response.locals.clique_model as IMyModel;
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.show_interest(you, clique_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async remove_interest(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const clique_model = response.locals.clique_model as IMyModel;
    
    const serviceMethodResults: ServiceMethodResults = await CliqueInterestsService.remove_interest(you, clique_model.get('id'));
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}