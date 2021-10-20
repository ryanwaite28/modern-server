import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import { 
  populate_common_notification_obj,
  user_attrs_slim
} from '../common.chamber';
import * as FollowsRepo from '../repos/follows.repo';
import * as CommonRepo from '../repos/_common.repo';
import { create_notification } from '../repos/notifications.repo';
import { Follows, Users } from '../models/user.model';
import { COMMON_EVENT_TYPES, MODERN_APP_NAMES } from '../enums/common.enum';
import { CommonSocketEventsHandler } from './socket-events-handlers-by-app/common.socket-event-handler';
import { ServiceMethodResults } from '../types/common.types';


export class FollowsService {
  static async check_user_follows(you_id: number, user_id: number) {
    if (!user_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is required`
        }
      };
      return serviceMethodResults;
    }
    if (user_id === you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is invalid: cannot be same as you_id`
        }
      };
      return serviceMethodResults;
    }
  
    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_follow
      }
    };
    return serviceMethodResults;
  }

  static async follow_user(you_id: number, user_id: number) {
    if (!user_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is required`
        }
      };
      return serviceMethodResults;
    }
    if (user_id === you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is invalid: cannot be same as you_id`
        }
      };
      return serviceMethodResults;
    }

    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });
    if (check_follow) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are already following this user`
        }
      };
      return serviceMethodResults;
    }

    const new_follow = await Follows.create({
      user_id: you_id, follows_id: user_id
    });

    Follows.findOne({
      where: { id: new_follow.get('id') },
      include: [{
        model: Users,
        as: 'following',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }],
    }).then((follow_model: any) => {
      create_notification({
        from_id: you_id,
        to_id: user_id,
        event: COMMON_EVENT_TYPES.NEW_FOLLOWER,
        micro_app: MODERN_APP_NAMES.COMMON,
        target_type: '',
        target_id: 0
      }).then(async (notification_model) => {
        const notification = await populate_common_notification_obj(notification_model);

        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user_id,
          event: COMMON_EVENT_TYPES.NEW_FOLLOWER,
          data: {
            data: {
              ...follow_model!.toJSON(),
              notification
            }
          }
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Followed!`,
        data: new_follow
      }
    };
    return serviceMethodResults;
  }

  static async unfollow_user(you_id: number, user_id: number) {
    if (!user_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is required`
        }
      };
      return serviceMethodResults;
    }
    if (user_id === you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is invalid: cannot be same as you_id`
        }
      };
      return serviceMethodResults;
    }

    const check_follow = await Follows.findOne({
      where: { user_id: you_id, follows_id: user_id },
    });
    if (!check_follow) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not following this user`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await check_follow.destroy();

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: COMMON_EVENT_TYPES.NEW_UNFOLLOWER,
      micro_app: MODERN_APP_NAMES.COMMON,
      target_type: '',
      target_id: 0
    }).then(async (notification_model) => {
      const notification = await populate_common_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: user_id,
        event: COMMON_EVENT_TYPES.NEW_UNFOLLOWER,
        data: {
          data: {
            notification
          }
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: `Unfollowed!`,
        data: deletes
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followers_count(user_id: number) {
    const followers_count = await FollowsRepo.get_user_followers_count(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: followers_count
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followings_count(user_id: number) {
    const followings_count = await FollowsRepo.get_user_followings_count(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: followings_count
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followers_all(user_id: number) {
    const results = await FollowsRepo.get_user_followers_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followings_all(user_id: number) {
    const results = await FollowsRepo.get_user_followings_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followers(user_id: number, follow_id?: number) {
    const results = await CommonRepo.paginateTable(
      Follows,
      'follows_id',
      user_id,
      follow_id,
      [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    );

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_followings(user_id: number, follow_id: number) {
    const results = await CommonRepo.paginateTable(
      Follows,
      'user_id',
      user_id,
      follow_id,
      [{
        model: Users,
        as: 'following',
        attributes: user_attrs_slim
      }]
    );

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }
}