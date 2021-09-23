import { Router } from 'express';
import { UserAuthorized, UserAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderInterviewExists } from '../guards/interviews.guard';
import { ContenderInterviewsService } from '../services/interview.service';


export const InterviewsRouter: Router = Router({ mergeParams: true });




InterviewsRouter.get('/:interview_id', ContenderInterviewExists, ContenderInterviewsService.get_interview_by_id);