import {
  Request,
  Response,
} from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';


const stripe = require("stripe")(process.env.STRIPE_SK);


export class StripeService {
  static readonly stripe = stripe;

  static async create_checkout_session(request: Request, response: Response) {

  }

  static async account_is_complete(account_id: any) {
    const stripe_account = await StripeService.stripe.accounts.retrieve(account_id);
    // console.log({ stripe_account });

    console.log({
      charges_enabled: stripe_account.charges_enabled,
      details_submitted: stripe_account.details_submitted,
      capabilities: stripe_account.capabilities,
    });

    if (!stripe_account.charges_enabled) {
      return {
        stripe_account,
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `You must complete your stripe account onboarding: charges must be enabled`
      };
    }

    if (!stripe_account.details_submitted) {
      return {
        stripe_account,
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `You must complete your stripe account onboarding: all required details must be submitted`
      };
    }

    const hasNeededCapabilities = (
      (stripe_account.capabilities.card_payments && stripe_account.capabilities.card_payments === 'active') ||
      (stripe_account.capabilities.transfers && stripe_account.capabilities.transfers === 'active')
    );
    if (!hasNeededCapabilities) {
      return {
        stripe_account,
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `You must complete your stripe account onboarding: charges must be enabled`
      };
    }

    return {
      stripe_account,
      error: false,
      status: HttpStatusCode.OK,
      message: `Stripe account connected and valid!`
    };
  }
}