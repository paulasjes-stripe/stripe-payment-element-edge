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

  const [clientSecret, setClientSecret] = useState("");
  
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("api/payment_intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },      
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      });
  }, []);

  const options = {
    clientSecret
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
          Edge says you are in: {country}.          
        </p>

        <div className={styles.description}>
        {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
