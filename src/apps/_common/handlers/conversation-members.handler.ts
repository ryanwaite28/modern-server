import { Request, Response } from 'express';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { ConversationMembersService } from '../services/conversation-members.service';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';



export class ConversationMembersRequestHandler {

  @CatchRequestHandlerError()
  static async get_conversation_members_all(request: Request, response: Response): ExpressResponse {
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.get_conversation_members_all(conversation_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_conversation_members(request: Request, response: Response): ExpressResponse {
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.get_conversation_members(conversation_id, member_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async add_conversation_member(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.add_conversation_member({ you_id, user_id, conversation_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async remove_conversation_member(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.remove_conversation_member({ you_id, user_id, conversation_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async leave_conversation(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = response.locals.conversation_model.get('id');

    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.leave_conversation(you_id, conversation_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async search_members(request: Request, response: Response): ExpressResponse {
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const query_term = request.query.query_term as string;
    
    const serviceMethodResults: ServiceMethodResults = await ConversationMembersService.search_members(conversation_id, query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}