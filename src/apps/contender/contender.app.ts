import { Router, Request, Response } from 'express';
import { InterviewAnswersRouter } from './routers/interview-answers.router';
import { InterviewQuestionsRouter } from './routers/interview-questions.router';
import { InterviewsRouter } from './routers/interviews.router';
import { SeminarsRouter } from './routers/seminars.router';
import { UsersRouter } from './routers/users.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const ContenderRouter: Router = Router({ mergeParams: true });
ContenderRouter.use(bodyParser.json());
ContenderRouter.options(`*`, corsMiddleware);

/** Mount Routers */

ContenderRouter.use('/users', corsMiddleware, UsersRouter);
ContenderRouter.use('/seminars', corsMiddleware, SeminarsRouter);
ContenderRouter.use('/interviews', corsMiddleware, InterviewsRouter);
ContenderRouter.use('/interview-questions', corsMiddleware, InterviewQuestionsRouter);
ContenderRouter.use('/interview-answers', corsMiddleware, InterviewAnswersRouter);