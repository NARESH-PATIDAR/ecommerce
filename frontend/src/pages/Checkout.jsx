import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Initialize Stripe outside of component to avoid recreation
const stripePromise = loadStripe('pk_test_51TTxPAJ7w6nFlMGAzslr1OYuJBqoUNSVgH39x1uN9j8JDQWgAoxpqKp3FD6KkEO8UkgDx1XHRqu2Q1CIeVVOjwDm001u2zJFVx');

const CheckoutForm = ({ token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required for some payment methods, but we use redirect: 'if_required'
        return_url: window.location.origin + '/success',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful, clear cart on backend
      try {
        await api.post("orders/payment-success/");
        navigate("/success");
      } catch (err) {
        console.error(err);
        setErrorMessage("Payment succeeded but failed to clear cart. Please contact support.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button 
        disabled={!stripe || processing} 
        style={{ 
          backgroundColor: processing ? '#ccc' : 'green', 
          color: 'white', 
          marginTop: '20px', 
          width: '100%',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
      {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const token = localStorage.getItem("myToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const getSecret = async () => {
      try {
        const response = await api.post("orders/create-payment-intent/");
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Failed to get client secret", err.response?.data?.error || err.message);
      }
    };

    getSecret();
  }, [token, navigate]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Secure Checkout</h2>
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm token={token} />
        </Elements>
      ) : (
        <p style={{ textAlign: 'center' }}>Loading payment details...</p>
      )}
    </div>
  );
};

export default Checkout;
