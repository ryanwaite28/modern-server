import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';

import * as UserRepo from '../../_common/repos/users.repo';
import * as FollowsRepo from '../../_common/repos/follows.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { Follows, Users } from '../../_common/models/user.model';
import { COMMON_EVENT_TYPES } from '../../_common/enums/common.enum';
import { SocketsService } from '../../_common/services/sockets.service';

export class ContenderInterviewsService {
  
  static async get_interview_by_id(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      data: response.locals.interview_model
    });
  }

}