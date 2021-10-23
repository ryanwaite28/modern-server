import { Request, Response } from 'express';
import { FollowsService } from '../services/follows.service';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';


export class FollowsRequestHandler {
  static async check_user_follows(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await FollowsService.check_user_follows(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async follow_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await FollowsService.follow_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async unfollow_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await FollowsService.unfollow_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followers_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followers_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followings_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followings_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followers_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followers_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followings_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followings_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followers(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const follow_id: number = parseInt(request.params.follow_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followers(user_id, follow_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_followings(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const follow_id: number = parseInt(request.params.follow_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FollowsService.get_user_followings(user_id, follow_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}