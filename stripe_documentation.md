# Stripe Integration Guide

This document explains how Stripe is implemented in this e-commerce project, how to test it, and how to learn more.

## Architecture & Flow

Stripe is integrated using the **Stripe Payment Intents API**, which is the recommended approach for custom React frontends. The general flow of a transaction is:

1. **User action**: A buyer logs in, adds products to their cart, and clicks "Proceed to Checkout" from the `/cart` page.
2. **Backend Intent Creation**: 
    - When the `/checkout` page loads, it sends a `POST` request to `/api/orders/create-payment-intent/` on the Django backend.
    - The backend calculates the total amount of the items in the user's cart.
    - It creates a Stripe `PaymentIntent` via `stripe.PaymentIntent.create()`.
    - It returns the generated `client_secret` to the frontend.
3. **Frontend Form Rendering**:
    - The React frontend uses the `Elements` component from `@stripe/react-stripe-js` to wrap the checkout form, passing it the `client_secret`.
    - It renders a `PaymentElement`, which is an embeddable UI component that securely collects payment details directly to Stripe's servers.
4. **Payment Confirmation**:
    - The user enters their card details and clicks "Pay Now".
    - The `stripe.confirmPayment` function securely submits the details.
    - Upon success, the frontend makes a call to `/api/orders/payment-success/` to clear the user's cart.
    - The user is redirected to the `/payment-success` page.

## Key Files

- **Backend**:
  - `backend/config/config/settings.py`: Contains `STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY`.
  - `backend/config/orders/views.py`: Contains `CreatePaymentIntentView` (for creating the intent) and `PaymentSuccessView` (for clearing the cart).
  - `backend/config/orders/urls.py`: Defines the routing for these payment views.
- **Frontend**:
  - `frontend/src/pages/Checkout.jsx`: Handles fetching the `clientSecret` and rendering the Stripe form.
  - `frontend/src/pages/PaymentSuccess.jsx`: The success screen displayed after payment.
  - `frontend/src/pages/Cart.jsx`: Contains the navigation button to the checkout page.

## Testing Payments

Because the API keys used are `pk_test_...` and `sk_test_...`, Stripe is operating in **Test Mode**. No real money is moved.

To simulate successful payments, use one of Stripe's test cards:

| Card Type | Card Number | Expiry Date | CVC | ZIP Code |
| :--- | :--- | :--- | :--- | :--- |
| **Visa (Success)** | `4242 4242 4242 4242` | Any future date (e.g., `12/30`) | Any 3 digits | Any 5 digits |
| **Mastercard (Success)** | `5555 5555 5555 4444` | Any future date | Any 3 digits | Any 5 digits |
| **Visa (Decline)** | `4000 0000 0000 0002` | Any future date | Any 3 digits | Any 5 digits |

> **Note**: For a full list of test cards (including those for simulating specific errors, 3D Secure, or insufficient funds), refer to the [Stripe Testing Documentation](https://stripe.com/docs/testing).

## Next Steps for Production

If you plan to deploy this project and accept real money, you must:

1. **Secure your Keys**: Ensure your `STRIPE_SECRET_KEY` is loaded from an `.env` file and is never pushed to GitHub.
2. **Switch to Live Keys**: Replace the `pk_test_...` and `sk_test_...` keys with your `pk_live_...` and `sk_live_...` keys from the Stripe Dashboard.
3. **Webhooks (Highly Recommended)**: The current implementation trusts the frontend to call `/payment-success/`. In a real-world application, users might close the browser right after payment, or a malicious user might try to trigger the success endpoint without paying. To securely fulfill orders, you should implement [Stripe Webhooks](https://stripe.com/docs/webhooks) in Django. A webhook allows Stripe to notify your backend asynchronously when a payment truly succeeds (`payment_intent.succeeded` event).
4. **Order Tracking**: Expand your models to include an `Order` and `OrderItem` model. When the webhook is received, create an `Order` object mapped to the user and mark it as 'Paid'.

## Learning Resources

- [Stripe Payments Quickstart (React)](https://stripe.com/docs/payments/quickstart?client=react)
- [Stripe Python SDK GitHub](https://github.com/stripe/stripe-python)
- [React Stripe.js GitHub](https://github.com/stripe/react-stripe-js)
