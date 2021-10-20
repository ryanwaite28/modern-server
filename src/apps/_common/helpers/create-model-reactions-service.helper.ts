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
import {
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ExpressRouteEndHandler, ServiceMethodAsyncResults, ServiceMethodResults } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';

export interface ICreateCommonGenericModelReactionsService {
  micro_app: string,
  target_type: string,
  base_model_name: string,
  reactionEvents: {
    REACTED: string,
    UNREACTED: string,
    CHANGE_REACTED: string,
  },
  populate_notification_fn: (notification: IMyModel) => any;
  reaction_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface IGenericModelReactionsService {
  get_user_reaction: (user_id: number, model_id: number) => ServiceMethodAsyncResults,
  toggle_user_reaction: (opts: {
    you: IUser,
    model: IMyModel,
    reaction: string,
    ignoreNotification?: boolean,
  }) => ServiceMethodAsyncResults,
  get_model_reactions_counts: (model_id: number) => ServiceMethodAsyncResults,
  get_model_reactions_all: (model_id: number) => ServiceMethodAsyncResults,
  get_model_reactions: (model_id: number, reaction_id: number) => ServiceMethodAsyncResults,
}

export function createCommonGenericModelReactionsService (
  params: ICreateCommonGenericModelReactionsService
) {
  const model_id_field = params.base_model_name + '_id';

  let Class: IGenericModelReactionsService;
  Class = class {
    static async get_user_reaction(user_id: number, model_id: number) {
      try {
        const model_reaction = await params.reaction_model.findOne({
          where: {
            model_id,
            owner_id: user_id
          }
        });
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.OK,
          error: false,
          info: {
            data: model_reaction
          }
        };
        return serviceMethodResults;
      }
      catch (e) {
        console.log(e);
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Could not get user reaction...`,
            data: {
              e
            }
          }
        };
        return serviceMethodResults;
      }
    }
  
    static async toggle_user_reaction(opts: {
      you: IUser,
      model: IMyModel,
      reaction: string,
      ignoreNotification?: boolean
    }) {
      const { you, model, reaction, ignoreNotification } = opts;
      const model_id: number = model.get('id');

      if (!reaction) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Reaction type is required`
          }
        };
        return serviceMethodResults;
      }
      if (!(typeof (reaction) === 'string')) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Reaction type is invalid`
          }
        };
        return serviceMethodResults;
      }
      if (!(reaction in COMMON_REACTION_TYPES)) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: false,
          info: {
            message: `Reaction type is invalid`
          }
        };
        return serviceMethodResults;
      }
  
      let model_reaction = await params.reaction_model.findOne({
        where: {
          model_id,
          owner_id: you.id
        }
      });
  
      let useEvent: string;
      
      if (!model_reaction) {
        // user has no reaction to reply; create it
        model_reaction = await params.reaction_model.create({
          reaction,
          model_id,
          owner_id: you.id
        });
        useEvent = params.reactionEvents.REACTED;
      } 
      else if (model_reaction.get('reaction') === reaction) {
        // user's reaction is same to request; they intended to undo the reaction
        await model_reaction.destroy();
        model_reaction = null;
        useEvent = params.reactionEvents.UNREACTED;
      } 
      else {
        // user's reaction is different to request; they intended to change the reaction
        model_reaction.reaction = reaction;
        await model_reaction.save({ fields: ['reaction'] });
        useEvent = params.reactionEvents.CHANGE_REACTED;
      }

      if (!ignoreNotification) {
        create_notification({
          from_id: you.id,
          to_id: model.get('owner_id'),
          micro_app: params.micro_app,
          event: useEvent,
          target_type: params.target_type,
          target_id: model.get('id'),
        }).then(async (notification_model) => {
          const notification = await params.populate_notification_fn(notification_model);
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: model.get('owner_id'),
            event: useEvent,
            data: {
              data: model_reaction,
              message: `Reaction toggled`,
              user: you,
              notification,
            }
          });
        });
      }
      

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Toggled reply reaction`,
          data: model_reaction
        }
      };
      return serviceMethodResults;
    }
  
    static async get_model_reactions_counts(model_id: number) {
      const like_count = await params.reaction_model.count({ where: { [model_id_field]: model_id, reaction: COMMON_REACTION_TYPES.LIKE } });
      const love_count = await params.reaction_model.count({ where: { [model_id_field]: model_id, reaction: COMMON_REACTION_TYPES.LOVE } });
      const idea_count = await params.reaction_model.count({ where: { [model_id_field]: model_id, reaction: COMMON_REACTION_TYPES.IDEA } });
      const confused_count = await params.reaction_model.count({ where: { [model_id_field]: model_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });
  
      const total_count: number = [
        like_count,
        love_count,
        idea_count,
        confused_count,
      ].reduce((acc, cur) => (acc + cur));

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: {
            total_count,
            like_count,
            love_count,
            idea_count,
            confused_count,
          }
        }
      };
      return serviceMethodResults;
    }
  
    static async get_model_reactions_all(model_id: number) {
      const model_reactions = await CommonRepo.getAll(
        params.reaction_model,
        model_id_field,
        model_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: model_reactions
        }
      };
      return serviceMethodResults;
    }
  
    static async get_model_reactions(model_id: number, reaction_id: number) {
      const model_reactions = await CommonRepo.paginateTable(
        params.reaction_model,
        model_id_field,
        model_id,
        reaction_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: model_reactions
        }
      };
      return serviceMethodResults;
    }
  };

  return Class;
}