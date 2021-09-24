import { Router } from 'express';
import { user_attrs_slim } from '../../../apps/_common/common.chamber';
import { createCommonGenericModelCommentRepliesService } from '../../../apps/_common/helpers/create-model-comment-replies-service.helper';
import { createGenericCommentsRouter } from '../../../apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from '../../../apps/_common/helpers/create-model-comments-service.helper';
import { Users } from '../../../apps/_common/models/user.model';
import { UserAuthorized, UserAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewExists } from '../guards/interviews.guard';
import { ContenderInterviewCommentReactions, ContenderInterviewCommentReplies, ContenderInterviewCommentReplyReactions, ContenderInterviewComments } from '../models/interviews.model';
import { get_interview_by_id } from '../repos/interviews.repo';
import { ContenderInterviewsService } from '../services/interview.service';



export const InterviewsRouter: Router = Router({ mergeParams: true });



InterviewsRouter.get('/:interview_id', ContenderInterviewExists, ContenderInterviewsService.get_interview_by_id);




/* --- Comments --- */

const InterviewCommentsService = createCommonGenericModelCommentsService({
  model_name: 'interview',
  comment_model: ContenderInterviewComments,
  comment_reaction_model: ContenderInterviewCommentReactions
});
const InterviewCommentRepliesService = createCommonGenericModelCommentRepliesService({
  model_name: 'interview',
  reply_model: ContenderInterviewCommentReplies,
  reply_reaction_model: ContenderInterviewCommentReplyReactions
});

const InterviewCommentsRouter = createGenericCommentsRouter({
  // comment
  commentsService: InterviewCommentsService,
  commentGuardsOpts: {
    get_model_fn: (id) => {
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
  // reply
  repliesService: InterviewCommentRepliesService,
  replyGuardsOpts: {
    get_model_fn: (id) => {
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

  generateRepliesRouter: true,
});


InterviewsRouter.use(`/:interview_id/comments`, InterviewCommentsRouter);

