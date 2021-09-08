import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as RepliesRepo from '../repos/newspost-comment-replies.repo';
import {
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  NewsPostCommentReplies,
  NewsPostCommentReplyReactions
} from '../models/newspost.model';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';

export class NewsPostCommentRepliesService {
  /** Request Handlers */

  static async main(request: Request, response: Response) {
    return response.status(HttpStatusCode.OK).json({
      msg: 'replies router'
    });
  }

  static async get_reply_by_id(request: Request, response: Response) {
    const reply_model = response.locals.reply_model;
    return response.status(HttpStatusCode.OK).json({
      data: reply_model
    });
  }

  static async get_comment_replies_count(request: Request, response: Response) {
    const comment_id: number = parseInt(request.params.comment_id, 10);
    const replies_count = await NewsPostCommentReplies.count({ where: { comment_id } });
    return response.status(HttpStatusCode.OK).json({
      data: replies_count
    });
  }

  static async get_comment_replies_all(request: Request, response: Response) {
    const comment_id: number = parseInt(request.params.comment_id, 10);
    const replys = await CommonRepo.getAll(
      NewsPostCommentReplies,
      'comment_id',
      comment_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: replys
    });
  }

  static async get_comment_replies(request: Request, response: Response) {
    const comment_id: number = parseInt(request.params.comment_id, 10);
    const reply_id = parseInt(request.params.reply_id, 10);
    const businesses = await CommonRepo.paginateTable(
      NewsPostCommentReplies,
      'comment_id',
      comment_id,
      reply_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: businesses
    });
  }

  static async get_user_reaction(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const reply_id: number = parseInt(request.params.reply_id, 10);
    const reply_reaction = await NewsPostCommentReplyReactions.findOne({
      where: {
        reply_id,
        owner_id: user_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: reply_reaction
    });
  }

  static async toggle_user_reaction(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const reply_id: number = parseInt(request.params.reply_id, 10);

    const reaction = request.body.reaction;
    if (!reaction) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is required`
      });
    }
    if (!(typeof (reaction) === 'string')) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is invalid`
      });
    }
    if (!(reaction in COMMON_REACTION_TYPES)) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reaction type is invalid`
      });
    }

    let reply_reaction = await NewsPostCommentReplyReactions.findOne({
      where: {
        reply_id,
        owner_id: you.id
      }
    });

    if (!reply_reaction) {
      // user has no reaction to reply; create it
      reply_reaction = await NewsPostCommentReplyReactions.create(<any> {
        reaction,
        reply_id,
        owner_id: you.id
      });
    } else if (reply_reaction.get('reaction') === reaction) {
      // user's reaction is same to request; they intended to undo the reaction
      await reply_reaction.destroy();
      reply_reaction = null;
    } else {
      // user's reaction is different to request; they intended to change the reaction
      reply_reaction.reaction = reaction;
      await reply_reaction.save({ fields: ['reaction'] });
    }


    return response.status(HttpStatusCode.OK).json({
      message: `Toggled reply reaction`,
      data: reply_reaction
    });
  }

  static async get_reply_reactions_counts(request: Request, response: Response) {
    const reply_id: number = parseInt(request.params.reply_id, 10);

    const like_count = await NewsPostCommentReplyReactions.count({ where: { reply_id, reaction: COMMON_REACTION_TYPES.LIKE } });
    const love_count = await NewsPostCommentReplyReactions.count({ where: { reply_id, reaction: COMMON_REACTION_TYPES.LOVE } });
    const idea_count = await NewsPostCommentReplyReactions.count({ where: { reply_id, reaction: COMMON_REACTION_TYPES.IDEA } });
    const confused_count = await NewsPostCommentReplyReactions.count({ where: { reply_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });

    const total_count: number = [
      like_count,
      love_count,
      idea_count,
      confused_count,
    ].reduce((acc, cur) => (acc + cur));

    return response.status(HttpStatusCode.OK).json({
      data: {
        total_count,
        like_count,
        love_count,
        idea_count,
        confused_count,
      }
    });
  }

  static async get_reply_reactions_all(request: Request, response: Response) {
    const reply_id: number = parseInt(request.params.reply_id, 10);
    const reply_reactions = await CommonRepo.getAll(
      NewsPostCommentReplyReactions,
      'reply_id',
      reply_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: reply_reactions
    });
  }

  static async get_reply_reactions(request: Request, response: Response) {
    const reply_id = parseInt(request.params.reply_id, 10);
    const reply_reaction_id: number = parseInt(request.params.reply_reaction_id, 10);
    const reply_reactions = await CommonRepo.paginateTable(
      NewsPostCommentReplyReactions,
      'reply_id',
      reply_id,
      reply_reaction_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: reply_reactions
    });
  }

  static async create_reply(request: Request, response: Response) {
    const you: IUser = response.locals.you;
    const comment_id: number = parseInt(request.params.comment_id, 10);
    let body: string = request.body.body;
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reply body is required`
      });
    }
    const reply_model = await RepliesRepo.create_newspost_comment_reply({ body, comment_id, owner_id: you.id });
    return response.status(HttpStatusCode.OK).json({
      message: `Reply created successfully`,
      data: reply_model
    });
  }

  static async update_reply(request: Request, response: Response) {
    const you: IUser = response.locals.you; 
    let body: string = request.body.body;
    const reply_id = parseInt(request.params.reply_id, 10);
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Reply body is required`
      });
    }
    const updates = await RepliesRepo.update_reply({ body }, reply_id);
    const reply = await RepliesRepo.get_newspost_comment_reply_by_id(reply_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Reply updated successfully`,
      updates: updates,
      data: reply
    });
  }

  static async delete_reply(request: Request, response: Response) {
    const reply_id = parseInt(request.params.reply_id, 10);
    const deletes = await RepliesRepo.delete_newspost_comment_reply(reply_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Reply deleted successfully`,
      deletes
    });
  }
}