import { Request, Response } from 'express';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { CliqueMembersService } from '../services/clique-members.service';
import { IMyModel } from '../../_common/models/common.model-types';



export class CliqueMembersRequestHandler {
  static async get_clique_member_requests_all(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_clique_member_requests_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_clique_member_requests(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const member_request_id = parseInt(request.params.member_request_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_clique_member_requests(you_id, member_request_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_clique_members_all(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_user_clique_members_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_clique_members(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_user_clique_members(user_id, member_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_clique_members_all(request: Request, response: Response): ExpressResponse {
    const clique_id = parseInt(request.params.clique_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_clique_members_all(clique_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_clique_members(request: Request, response: Response): ExpressResponse {
    const clique_id = parseInt(request.params.clique_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.get_clique_members(clique_id, member_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async add_clique_member(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.add_clique_member(user_id, clique_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async remove_clique_member(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.remove_clique_member(user_id, clique_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async leave_clique(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const clique_model = response.locals.clique_model as IMyModel;

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.leave_clique(you, clique_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async search_members(request: Request, response: Response): ExpressResponse {
    const clique_id = parseInt(request.params.clique_id, 10);
    const query_term = (<string> request.query.query_term || '').trim().toLowerCase();

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.search_members(clique_id, query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async send_clique_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;
    const opts = { you_id, user_id, clique_model };

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.send_clique_member_request(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async cancel_clique_member_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const member_request_id = parseInt(request.params.member_request_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;
    const opts = { you, member_request_id, clique_model };

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.cancel_clique_member_request(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async accept_clique_member_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const member_request_id = parseInt(request.params.member_request_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;
    const opts = { you, member_request_id, clique_model };

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.accept_clique_member_request(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async decline_clique_member_request(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you as IUser;
    const member_request_id = parseInt(request.params.member_request_id, 10);
    const clique_model = response.locals.clique_model as IMyModel;
    const opts = { you, member_request_id, clique_model };

    const serviceMethodResults: ServiceMethodResults = await CliqueMembersService.decline_clique_member_request(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}