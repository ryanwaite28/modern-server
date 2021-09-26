import { Router } from 'express';
import { createGenericCommentRepliesRouter } from 'src/apps/_common/helpers/create-model-comment-replies-router.helper';
import { createModelRouteGuards } from 'src/apps/_common/helpers/create-model-guards.helper';
import { createCommonGenericModelReactionsRouter } from 'src/apps/_common/helpers/create-model-reactions-router.helper.';
import { createCommonGenericModelReactionsService } from 'src/apps/_common/helpers/create-model-reactions-service.helper';
import { user_attrs_slim } from '../../../apps/_common/common.chamber';
import { createCommonGenericModelCommentRepliesService } from '../../../apps/_common/helpers/create-model-comment-replies-service.helper';
import { createGenericCommentsRouter } from '../../../apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from '../../../apps/_common/helpers/create-model-comments-service.helper';
import { Users } from '../../../apps/_common/models/user.model';
import {
  ContenderInterviewCommentReactions,
  ContenderInterviewCommentReplies,
  ContenderInterviewCommentReplyReactions,
  ContenderInterviewComments,
  ContenderInterviewReactions,
} from '../models/interviews.model';
import { get_interview_by_id } from '../repos/interviews.repo';
import { ContenderInterviewsService } from '../services/interview.service';



export const InterviewsRouter: Router = Router({ mergeParams: true });

const interviewRouteGuards = createModelRouteGuards({
  get_model_fn: get_interview_by_id,
  model_name: 'interview',
  model_owner_field: 'owner_id',
  request_param_id_name: 'interview_id',
});



InterviewsRouter.get('/:interview_id', interviewRouteGuards.existsGuard, ContenderInterviewsService.get_interview_by_id);



/* --- Reactions --- */

const interviewReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'interview',
  reaction_model: ContenderInterviewReactions
})
const ReactionsRouter = createCommonGenericModelReactionsRouter({
  base_model_name: 'interview',
  makeGuard: false,
  modelGuardsOpts: interviewRouteGuards,
  reactionService: interviewReactionsService,
});
InterviewsRouter.use(ReactionsRouter);



/* --- Comments --- */

const InterviewCommentsService = createCommonGenericModelCommentsService({
  model_name: 'interview',
  comment_model: ContenderInterviewComments,
  comment_reaction_model: ContenderInterviewCommentReactions
});
const InterviewCommentsRouter = createGenericCommentsRouter({
  commentsService: InterviewCommentsService,
  commentGuardsOpts: {
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
  },
});
InterviewsRouter.use(`/:interview_id/comments`, InterviewCommentsRouter);



/* --- Comment Replies --- */

const InterviewCommentRepliesService = createCommonGenericModelCommentRepliesService({
  comment_reply_model: ContenderInterviewCommentReplies,
  comment_reply_reaction_model: ContenderInterviewCommentReplyReactions
});
const RepliesRouter = createGenericCommentRepliesRouter({
  repliesService: InterviewCommentRepliesService,
  replyGuardsOpts: {
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
  },
});
RepliesRouter.use(`/:interview_id/comments/:comment_id/replies`, RepliesRouter);
