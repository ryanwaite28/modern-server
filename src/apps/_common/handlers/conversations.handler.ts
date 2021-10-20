import {
  Request,
  Response,
} from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';
import { ConversationsService } from '../services/conversations.service';



export class ConversationsRequestHandler {
  static async get_user_conversations_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_conversations(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const conversation_timestamp: string = request.params.conversation_timestamp;
    const opts = { you_id, conversation_timestamp };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async create_conservation(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const title: string = (request.body.title || '').trim();
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const opts = { you_id, title, icon_file };

    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.create_conservation(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_conservation(request: Request, response: Response): ExpressResponse {
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const title: string = (request.body.title || '').trim();
    const conversation_id: number = parseInt(request.params.conversation_id, 10);
    const opts = { conversation_id, title, icon_file };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.update_conservation(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_conservation(request: Request, response: Response): ExpressResponse {
    const conversation_id: number = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.delete_conservation(conversation_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}