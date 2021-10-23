import { Router } from 'express';
import { InfoRequestHandler } from '../handlers/info.handler';

export const InfoRouter: Router = Router();

InfoRouter.get('/site-info', InfoRequestHandler.get_site_info);
InfoRouter.get('/recent-activity', InfoRequestHandler.get_recent_activity);
InfoRouter.get('/app-news', InfoRequestHandler.get_business_news);