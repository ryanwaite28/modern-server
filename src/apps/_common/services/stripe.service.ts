import { HttpStatusCode } from '../enums/http-codes.enum';
import Stripe from 'stripe';
import { UsersService } from './users.service';



const stripe: Stripe = new Stripe(process.env.STRIPE_SK!, {
  apiVersion: '2020-08-27',
});
export const DELIVERME_APP_FEE = 0.08;



/*  
  https://stripe.com/pricing
*/



export class StripeService {
  static readonly stripe: Stripe = stripe;

  static add_on_stripe_processing_fee(amount: number, isAmountAdjusted: boolean = false) {
    const stripePercentageFeeRate = 0.029;
    const stripeFixedFeeRate = 30; // 30 cents

    const total = isAmountAdjusted ? amount : parseInt(amount.toString() + '00');
    const stripe_processing_fee = Math.round(total * stripePercentageFeeRate) + stripeFixedFeeRate;
    let new_total = Math.round(total + stripe_processing_fee);
    const difference = new_total - total;
    let app_fee = (parseInt((total * 0.1).toString(), 10));
    // app_fee = Math.round(difference + app_fee);
    const final_total = Math.round(new_total + app_fee);
    // new_total = new_total + app_fee;
    const data = { amount, final_total, app_fee, stripe_processing_fee, new_total, isAmountAdjusted, total, difference };
    console.log(data);
    return data;
  }

  static async account_is_complete(account_id: any) {
    const stripe_account: Stripe.Account = await StripeService.stripe.accounts.retrieve(account_id);

    console.log({ stripe_account });
    console.log({
      ...stripe_account.settings,
      externa_accounts: stripe_account.external_accounts?.data,
    });

    console.log({
      charges_enabled: stripe_account.charges_enabled,
      details_submitted: stripe_account.details_submitted,
      capabilities: stripe_account.capabilities,
      payouts_enabled: stripe_account.payouts_enabled,
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
      // (stripe_account.capabilities?.card_payments && stripe_account.capabilities.card_payments === 'active') &&
      (stripe_account.capabilities?.transfers && stripe_account.capabilities.transfers === 'active')
    );
    if (!hasNeededCapabilities) {
      return {
        stripe_account,
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `You must complete your stripe account onboarding: transfers must be enabled`
      };
    }

    return {
      stripe_account,
      error: false,
      status: HttpStatusCode.OK,
      message: `Stripe account connected and valid!`
    };
  }

  static async get_connected_account_cards_payment_methods(stripe_customer_id: string) {
    const paymentMethods = await StripeService.stripe.accounts

    return paymentMethods;
  }



  static async get_customer_cards_payment_methods(stripe_customer_id: string) {
    const paymentMethods = await StripeService.stripe.paymentMethods.list({
      customer: stripe_customer_id,
      type: 'card',
    });

    return paymentMethods;
  }

  static async customer_account_has_card_payment_method(customer_id: string) {
    const user_payment_methods = await StripeService.get_customer_cards_payment_methods(customer_id);
    const payment_methods = user_payment_methods.data;

    console.log({
      payment_methods,
    });

    if (payment_methods.length === 0) {
      return {
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `User has no cards; add a debit/credit card to your customer account`
      };
    }

    return {
      error: false,
      status: HttpStatusCode.OK,
      message: `Stripe customer account has card(s) payment methods!`
    };
  }

  static async payment_method_belongs_to_customer(customer_id: string, payment_intent_id: string) {
    const user_payment_methods = await StripeService.get_customer_cards_payment_methods(customer_id);
    const payment_methods = user_payment_methods.data;

    console.log({
      payment_methods,
    });

    if (payment_methods.length === 0) {
      return {
        error: true,
        status: HttpStatusCode.PRECONDITION_FAILED,
        message: `User has no cards; add a debit/credit card to your customer account`
      };
    }

    for (const pm of payment_methods) {
      if (pm.id === payment_intent_id) {
        return {
          error: false,
          status: HttpStatusCode.OK,
          message: `Payment method belongs customer account`
        };
      }
    }

    return {
      error: true,
      status: HttpStatusCode.BAD_REQUEST,
      message: `Payment method does not belongs customer account`
    };
  }
}