import {
  Request,
  Response,
} from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';


const stripe = require("stripe")(process.env.STRIPE_SK);
export const DELIVERME_APP_FEE = 0.08;



/*  
  https://stripe.com/pricing
*/



export class StripeService {
  static readonly stripe = stripe;

  static add_on_stripe_processing_fee(amount: number, isAmountAdjusted: boolean = false) {
    const stripePercentageFeeRate = 0.029;
    const stripeFixedFeeRate = 30; // 30 cents

    const total = isAmountAdjusted ? amount : parseInt(amount.toString() + '00');
    const fee_percentage = (total * stripePercentageFeeRate);
    let new_total = Math.round(total + (fee_percentage + stripeFixedFeeRate));
    const difference = new_total - total;
    let app_fee = (parseInt((total * 0.1).toString(), 10));
    app_fee = Math.round(difference + app_fee);
    const final_total = Math.round(new_total + app_fee);
    // new_total = new_total + app_fee;
    const data = { amount, final_total, app_fee, fee_percentage, new_total, isAmountAdjusted, total, difference };
    console.log(data);
    return data;
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