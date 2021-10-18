import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import { MarkersService } from '../services/markers.service';

export class MarkersRequestHandler {
  /** Request Handlers */

  static async get_marker_by_id(request: Request, response: Response) {
    const marker_model = response.locals.marker_model;
    return response.status(HttpStatusCode.OK).json({
      data: marker_model
    });
  }

  static async get_random_markers(request: Request, response: Response) {
    const marker_models = MarkersService.get_random_markers();
    return response.status(HttpStatusCode.OK).json({
      data: marker_models
    });
  }

  static async get_user_markers_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await MarkersService.get_user_markers_all(user_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_markers(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const marker_id = parseInt(request.params.marker_id, 10);
    
    const results = await MarkersService.get_user_markers(user_id, marker_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_reaction(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const marker_id: number = parseInt(request.params.marker_id, 10);
    
    const results = await MarkersService.get_user_reaction(user_id, marker_id);
    return response.status(results.status).json(results.info);
  }

  static async toggle_user_reaction(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const marker_id: number = parseInt(request.params.marker_id, 10);
    const reaction = request.body.reaction;
    
    const results = await MarkersService.toggle_user_reaction({ you, marker_id, reaction });
    return response.status(results.status).json(results.info);
  }

  static async get_marker_reactions_counts(request: Request, response: Response) {
    const marker_id: number = parseInt(request.params.marker_id, 10);

    const results = await MarkersService.get_marker_reactions_counts(marker_id);
    return response.status(results.status).json(results.info);
  }

  static async get_marker_reactions_all(request: Request, response: Response) {
    const marker_id: number = parseInt(request.params.marker_id, 10);
    
    const results = await MarkersService.get_marker_reactions_all(marker_id);
    return response.status(results.status).json(results.info);
  }

  static async get_marker_reactions(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    const reaction_id: number = parseInt(request.params.marker_reaction_id, 10);
    
    const results = await MarkersService.get_marker_reactions(marker_id, reaction_id);
    return response.status(results.status).json(results.info);
  }
  
  static async create_marker(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    const marker_icon: UploadedFile | undefined = request.files && (<UploadedFile> request.files.marker_icon);
    
    const results = await MarkersService.create_marker({ you, data, marker_icon });
    return response.status(results.status).json(results.info);
  }

  static async update_marker(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    let caption: string = request.body.caption;
    
    const results = await MarkersService.update_marker(marker_id, caption);
    return response.status(results.status).json(results.info);
  }

  static async delete_marker(request: Request, response: Response) {
    const marker_id = parseInt(request.params.marker_id, 10);
    
    const results = await MarkersService.delete_marker(marker_id);
    return response.status(results.status).json(results.info);
  }
}