import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import CheckoutForm from '../components/CheckoutForm';

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe('pk_test_Ut6rjxrjvQumuE0ijeP8sNmr00ufIjrvZV');

// Forward properties from `_middleware.ts`
export const getServerSideProps = ({ query }: any) => ({
  props: query,
})

const Home: NextPage = ({
  country
}: any) => {
  country = decodeURIComponent(country);

  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("api/payment_intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
        setCurrency(data.currency);
      });
  }, []);

  const options = {
    clientSecret,
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Stripe Payment Element with Edge Functions</title>
        <meta name="description" content="Stripe Payment Element" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Stripe Payment Element with Edge Functions
        </h1>

        <p>
          This sample will use Next.js' middleware in combination with Stripe's Payment Element and Automatic Payment Methods.
          After enabling all the possible PaymentMethods in the dashboard, we can use the geolocation data from Next.js to calculate the Purchasing Power Parity price and use the correct currency.
          The Payment Element will then automatically pick the PaymentMethods best suited for the currency and location combination.
        </p>

        <p>
          Geolocation says you are in: {country}. With PPP enabled, you will be charged {currency} {amount} instead of USD $100.
        </p>


        <div className={styles.description}>
        {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home
