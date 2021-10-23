import { Router } from 'express';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';
import { populate_contender_notification_obj } from '../contender.chamber';
import { CONTENDER_EVENT_TYPES } from '../enums/contender.enum';
import {
  ContenderInterviewCommentReactions,
  ContenderInterviewCommentReplies,
  ContenderInterviewCommentReplyReactions,
  ContenderInterviewComments,
  ContenderInterviewReactions,
} from '../models/interviews.model';
import { get_interview_by_id } from '../repos/interviews.repo';
import { ContenderInterviewsService } from '../services/interview.service';
import { MountGenericModelSocialRouterServiceHandler } from '../../_common/helpers/mount-model-social-router-service-handler.helper';



export const InterviewsRouter: Router = Router({ mergeParams: true });

const InterviewRouteGuards = createModelRouteGuards({
  get_model_fn: get_interview_by_id,
  model_name: 'interview',
  model_owner_field: 'owner_id',
  request_param_id_name: 'interview_id',
});



InterviewsRouter.get('/:interview_id', InterviewRouteGuards.existsGuard, ContenderInterviewsService.get_interview_by_id);





MountGenericModelSocialRouterServiceHandler({
  base_model_name: `interview`,
  base_model_route_guards: InterviewRouteGuards,
  mountingRouter: InterviewsRouter,
  micro_app: MODERN_APP_NAMES.CONTENDER,
  eventsEnumObj: CONTENDER_EVENT_TYPES,
  populate_notification_fn: populate_contender_notification_obj,
  models: {
    base_reactions_model: ContenderInterviewReactions,
    base_comments_model: ContenderInterviewComments,
    base_comment_reactions_model: ContenderInterviewCommentReactions,
    base_comment_replies_model: ContenderInterviewCommentReplies,
    base_comment_reply_reactions_model: ContenderInterviewCommentReplyReactions,
  }
});
