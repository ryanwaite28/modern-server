import { Router } from 'express';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { createGenericCommentRepliesRouter } from '../../_common/helpers/create-model-comment-replies-router.helper';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';
import { createCommonGenericModelReactionsRouter } from '../../_common/helpers/create-model-reactions-router.helper.';
import { createCommonGenericModelReactionsService } from '../../_common/helpers/create-model-reactions-service.helper';
import { user_attrs_slim } from '../../../apps/_common/common.chamber';
import { createCommonGenericModelCommentRepliesService } from '../../../apps/_common/helpers/create-model-comment-replies-service.helper';
import { createGenericCommentsRouter } from '../../../apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from '../../../apps/_common/helpers/create-model-comments-service.helper';
import { Users } from '../../../apps/_common/models/user.model';
import { populate_contender_notification_obj } from '../contender.chamber';
import { CONTENDER_EVENT_TYPES, CONTENDER_NOTIFICATION_TARGET_TYPES } from '../enums/contender.enum';
import {
  ContenderInterviewCommentReactions,
  ContenderInterviewCommentReplies,
  ContenderInterviewCommentReplyReactions,
  ContenderInterviewComments,
  ContenderInterviewReactions,
} from '../models/interviews.model';
import { get_interview_by_id } from '../repos/interviews.repo';
import { ContenderInterviewsService } from '../services/interview.service';
import { createCommonGenericModelReactionsRequestHandler } from '../../_common/helpers/create-model-reactions-request-handler.helper';
import { createCommonGenericModelCommentsRequestHandler } from '../../_common/helpers/create-model-comments-request-handler.helper';
import { createCommonGenericModelCommentRepliesRequestHandler } from '../../_common/helpers/create-model-comment-replies-request-handler.helper';



export const InterviewsRouter: Router = Router({ mergeParams: true });

const InterviewRouteGuards = createModelRouteGuards({
  get_model_fn: get_interview_by_id,
  model_name: 'interview',
  model_owner_field: 'owner_id',
  request_param_id_name: 'interview_id',
});



InterviewsRouter.get('/:interview_id', InterviewRouteGuards.existsGuard, ContenderInterviewsService.get_interview_by_id);



/* --- Interview Reactions --- */

const InterviewReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'interview',
  micro_app: MODERN_APP_NAMES.CONTENDER,
  reactionEvents: {
    REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_REACTION,
    UNREACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_UNREACTION,
    CHANGE_REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_CHANGED_REACTION,
  },
  target_type: CONTENDER_NOTIFICATION_TARGET_TYPES.INTERVIEW,
  populate_notification_fn: populate_contender_notification_obj,
  reaction_model: ContenderInterviewReactions
});
const InterviewReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: `interview`,
  reactionsService: InterviewReactionsService,
});
const InterviewReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: InterviewReactionsRequestHandler,
});
InterviewsRouter.use('/:interview_id', InterviewRouteGuards.existsGuard, InterviewReactionsRouter);



/* --- Interview Comments --- */

const InterviewCommentsService = createCommonGenericModelCommentsService({
  base_model_name: 'interview',
  micro_app: MODERN_APP_NAMES.CONTENDER,
  create_model_event: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT,
  target_type: CONTENDER_NOTIFICATION_TARGET_TYPES.INTERVIEW,
  populate_notification_fn: populate_contender_notification_obj,
  comment_model: ContenderInterviewComments,
});
const InterviewCommentsGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return ContenderInterviewComments.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    })
  },
  model_name: 'comment',
  model_owner_field: 'owner_id',
  request_param_id_name: 'comment_id',
});
const InterviewCommentsRequestHandler = createCommonGenericModelCommentsRequestHandler({
  base_model_name: 'interview',
  commentsService: InterviewCommentsService,
});
const InterviewCommentsRouter = createGenericCommentsRouter({
  commentsRequestHandler: InterviewCommentsRequestHandler,
  commentGuardsOpts: InterviewCommentsGuard,
});
InterviewsRouter.use(`/:interview_id/comments`, InterviewRouteGuards.existsGuard, InterviewCommentsRouter);



/* --- Interview Comment Reactions --- */

const InterviewCommentReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'interview',
  micro_app: MODERN_APP_NAMES.CONTENDER,
  reactionEvents: {
    REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REACTION,
    UNREACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_UNREACTION,
    CHANGE_REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_CHANGED_REACTION,
  },
  target_type: CONTENDER_NOTIFICATION_TARGET_TYPES.INTERVIEW_COMMENT,
  populate_notification_fn: populate_contender_notification_obj,
  reaction_model: ContenderInterviewCommentReactions
});
const InterviewCommentReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'interview',
  reactionsService: InterviewCommentReactionsService,
});
const InterviewCommentReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: InterviewCommentReactionsRequestHandler, 
});
InterviewsRouter.use(`/:interview_id/comments/:comment_id`, InterviewRouteGuards.existsGuard, InterviewCommentsGuard.existsGuard, InterviewCommentReactionsRouter);




/* --- Interview Comment Replies --- */

const InterviewCommentRepliesService = createCommonGenericModelCommentRepliesService({
  micro_app: MODERN_APP_NAMES.CONTENDER,
  create_model_event: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REPLY,
  target_type: CONTENDER_NOTIFICATION_TARGET_TYPES.INTERVIEW_COMMENT_REPLY,
  populate_notification_fn: populate_contender_notification_obj,
  comment_reply_model: ContenderInterviewCommentReplies,
});
const InterviewCommentReplyGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return ContenderInterviewCommentReplies.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    })
  },
  model_name: 'reply',
  model_owner_field: 'owner_id',
  request_param_id_name: 'reply_id',
});
const InterviewCommentRepliesRequestHandler = createCommonGenericModelCommentRepliesRequestHandler({
  commentRepliesService: InterviewCommentRepliesService
});
const InterviewCommentRepliesRouter = createGenericCommentRepliesRouter({
  repliesRequestHandler: InterviewCommentRepliesRequestHandler,
  replyGuardsOpts: InterviewCommentReplyGuard,
});
InterviewsRouter.use(`/:interview_id/comments/:comment_id/replies`, InterviewRouteGuards.existsGuard, InterviewCommentsGuard.existsGuard, InterviewCommentRepliesRouter);



/* --- Interview Comment Reply Reactions --- */

const InterviewCommentReplyReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'interview',
  micro_app: MODERN_APP_NAMES.CONTENDER,
  reactionEvents: {
    REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REPLY_REACTION,
    UNREACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REPLY_UNREACTION,
    CHANGE_REACTED: CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REPLY_CHANGED_REACTION,
  },
  target_type: CONTENDER_NOTIFICATION_TARGET_TYPES.INTERVIEW_COMMENT_REPLY,
  populate_notification_fn: populate_contender_notification_obj,
  reaction_model: ContenderInterviewCommentReplyReactions
});
const InterviewCommentReplyReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'interview',
  reactionsService: InterviewCommentReplyReactionsService
});
const InterviewCommentReplyReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: InterviewCommentReplyReactionsRequestHandler,
});
InterviewsRouter.use(`/:interview_id/comments/:comment_id/replies/:reply_id`, InterviewRouteGuards.existsGuard, InterviewCommentsGuard.existsGuard, InterviewCommentReplyGuard.existsGuard, InterviewCommentReplyReactionsRouter);
