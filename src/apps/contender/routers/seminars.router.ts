import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { ContenderSeminarExists } from '../guards/seminar.guard';
import { ContenderSeminarsService } from '../services/seminars.service';


export const SeminarsRouter: Router = Router({ mergeParams: true });




SeminarsRouter.get('/:seminar_id', ContenderSeminarExists, ContenderSeminarsService.get_seminar_by_id);