import { Stripe } from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next'

import currencies from '../../public/currencies.json';

type Data = {
  amount: number,
  currency: string,
  symbol: string,
  clientSecret: string | null
};

type Currency = {
  symbol: string,
  minimum: string,
  zeroDecimal?: boolean,
}

type CurrencyData = {
  [code: string]: Currency,
}

const PPP_API = 'https://api.purchasing-power-parity.com/?target=';

const stripe: Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    try {
      const { ppp } = await fetch(`${PPP_API}${req.query.country}`)
        .then(res => res.json());

      console.log(`Creating PaymentIntent for: ${req.query.country}`);

      const { currencyMain, pppConversionFactor: conversionFactor }  = ppp;
      const { exchangeRate } = currencyMain;

      // Just grab the first currency
      const currency: string = Object.keys(ppp.currenciesCountry)[0];

      const { minimum, symbol, zeroDecimal } = (currencies as CurrencyData)[currency] as Currency;

      // Amount we wish to charge in USD
      const amount: number = 100;

      const localAmount: number = amount * exchangeRate;

      let discountedAmount: number = Math.round((localAmount * conversionFactor) * (zeroDecimal ? 1 : 100));

      // Make sure we charge the minimum amount
      if (minimum) {
        discountedAmount = Math.max(discountedAmount, parseFloat(minimum));
      }

      const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create({
        amount: discountedAmount,
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(200).json({
        amount: discountedAmount / (zeroDecimal ? 1 : 100),
        currency: currency,
        symbol: symbol,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err: any) {
      console.log(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  }
}
