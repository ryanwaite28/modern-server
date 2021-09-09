import { Router } from 'express';
import {
  XSRF_PROTECTED,
  XSRF_PROTECTED_2
} from '../guards/xsrf.guard';
import { UtilsService } from '../services/utils.service';

export const UtilsRouter: Router = Router();

UtilsRouter.get('/get-xsrf-token', UtilsService.get_xsrf_token);
UtilsRouter.get('/get-xsrf-token-pair', UtilsService.get_xsrf_token_pair);

UtilsRouter.post('/get-google-api-key', XSRF_PROTECTED_2, UtilsService.get_google_maps_key);