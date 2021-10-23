import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewQuestionExists } from '../guards/interview-questions.guard';
import { ContenderInterviewQuestionsRequestHandler } from '../handlers/interview-questions.handler';


export const InterviewQuestionsRouter: Router = Router({ mergeParams: true });




InterviewQuestionsRouter.get('/:interview_question_id', ContenderInterviewQuestionExists, ContenderInterviewQuestionsRequestHandler.get_interview_question_by_id);