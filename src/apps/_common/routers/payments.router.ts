import { Router } from 'express';
import { StripeService } from '../services/stripe.service';

export const PaymentsRouter: Router = Router();




PaymentsRouter.post(`/create-checkout-session`, StripeService.create_checkout_session);