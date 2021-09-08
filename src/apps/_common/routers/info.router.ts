import { Router } from 'express';
import { InfoService } from '../services/info.service';

export const InfoRouter: Router = Router();

InfoRouter.get('/site-info', InfoService.get_site_info);
InfoRouter.get('/recent-activity', InfoService.get_recent_activity);
InfoRouter.get('/app-news', InfoService.get_business_news);