import { Router } from 'express';
import { XSRF_PROTECTED } from '../guards/xsrf.guard';
import { UtilsService } from '../services/utils.service';

export const UtilsRouter: Router = Router();

UtilsRouter.get('/get-xsrf-token', UtilsService.get_xsrf_token);

UtilsRouter.post('/get-google-api-key', XSRF_PROTECTED, UtilsService.get_google_maps_key);