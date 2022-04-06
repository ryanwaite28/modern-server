import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';
import { ConversationsService } from '../services/conversations.service';
import { CatchRequestHandlerError } from '../decorators/common.decorator';



export class ConversationsRequestHandler {
  @CatchRequestHandlerError()
  static async get_user_conversations_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_conversations(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const conversation_timestamp: string = request.params.conversation_timestamp;
    const options = { you_id, conversation_timestamp };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_conservation(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const title: string = (request.body.title || '').trim();
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const options = { you_id, title, icon_file };

    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.create_conservation(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_conservation(request: Request, response: Response): ExpressResponse {
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const title: string = (request.body.title || '').trim();
    const conversation_id: number = parseInt(request.params.conversation_id, 10);
    const options = { conversation_id, title, icon_file };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.update_conservation(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async delete_conservation(request: Request, response: Response): ExpressResponse {
    const conversation_id: number = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.delete_conservation(conversation_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}