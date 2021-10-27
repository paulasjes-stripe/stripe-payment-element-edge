import { Stripe } from "stripe";
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  clientSecret: string | null
}

const stripe: Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {    
  if (req.method === 'POST') {
    try {
      const paymentMethodTypes: Array<string> = ['card'];
      let currency: string = 'usd';

      // The Payment Element will automatically hide and show payment methods based on the customer's locale
      // but Edge Functions allows us to customize further by only specifying the use of a payment method if the 
      // customer's country matches
      switch (req.query.country) {
        case 'NL':
          paymentMethodTypes.push('ideal');
          currency = 'eur';
          break;

        case 'BE':
          paymentMethodTypes.push('bancontact');
          currency = 'eur';
          break;

        case 'SG':
          paymentMethodTypes.push('grabpay');
          currency = 'sgd';
          break;
      }

      const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: currency,
        payment_method_types: paymentMethodTypes,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err: any) {
      console.log(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  }
}
