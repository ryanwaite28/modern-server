import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewQuestionExists } from '../guards/interview-questions.guard';
import { ContenderInterviewQuestionsService } from '../services/interview-questions.service';


export const InterviewQuestionsRouter: Router = Router({ mergeParams: true });




InterviewQuestionsRouter.get('/:interview_question_id', ContenderInterviewQuestionExists, ContenderInterviewQuestionsService.get_interview_question_by_id);