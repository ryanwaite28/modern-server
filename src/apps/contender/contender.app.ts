import { Router, Request, Response } from 'express';
import { InterviewAnswersRouter } from './routers/interview-answers.router';
import { InterviewQuestionsRouter } from './routers/interview-questions.router';
import { InterviewsRouter } from './routers/interviews.router';
import { SeminarsRouter } from './routers/seminars.router';
import { UsersRouter } from './routers/users.router';

export const ContenderRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

ContenderRouter.use('/users', UsersRouter);
ContenderRouter.use('/seminars', SeminarsRouter);
ContenderRouter.use('/interviews', InterviewsRouter);
ContenderRouter.use('/interview-questions', InterviewQuestionsRouter);
ContenderRouter.use('/interview-answers', InterviewAnswersRouter);