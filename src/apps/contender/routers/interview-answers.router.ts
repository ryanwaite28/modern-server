import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewAnswerExists } from '../guards/interview-answers.guard';
import { ContenderInterviewAnswersService } from '../services/interview-answers.service';


export const InterviewAnswersRouter: Router = Router({ mergeParams: true });




InterviewAnswersRouter.get('/:interview_answer_id', ContenderInterviewAnswerExists, ContenderInterviewAnswersService.get_interview_answer_by_id);