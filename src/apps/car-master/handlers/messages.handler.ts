import { Request, Response } from 'express';
import { MessagesService } from '../services/messages.service';
import { CatchRequestHandlerError } from '../../_common/decorators/common.decorator';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';

export class MessagesRequestHandler {
  @CatchRequestHandlerError()
  static async get_user_messages(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);
    const min_id: number = parseInt(request.params.min_id, 10);
    const options = { you_id, user_id, min_id };
    
    const serviceMethodResults: ServiceMethodResults = await MessagesService.get_user_messages(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async send_user_message(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);
    const body: string = request.body.body;
    const options = { you_id, user_id, body };

    const serviceMethodResults: ServiceMethodResults = await MessagesService.send_user_message(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_message_as_read(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const message_id: number = parseInt(request.params.message_id, 10);

    const serviceMethodResults: ServiceMethodResults = await MessagesService.mark_message_as_read(you_id, message_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}