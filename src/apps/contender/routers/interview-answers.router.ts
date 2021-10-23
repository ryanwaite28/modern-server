import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewAnswerExists } from '../guards/interview-answers.guard';
import { ContenderInterviewAnswersRequestHandler } from '../handlers/interview-answers.handler';


export const InterviewAnswersRouter: Router = Router({ mergeParams: true });




InterviewAnswersRouter.get('/:interview_answer_id', ContenderInterviewAnswerExists, ContenderInterviewAnswersRequestHandler.get_interview_answer_by_id);