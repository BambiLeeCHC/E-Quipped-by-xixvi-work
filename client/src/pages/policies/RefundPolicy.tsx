/**
 * client/src/pages/policies/RefundPolicy.tsx
 */
import PolicyLayout from "./PolicyLayout";

const sections = [
  {
    title: "1. Our Commitment",
    body: `We stand behind the quality of E-Quipped: Work. If you are not completely satisfied with your Lifetime Access purchase, we offer a straightforward 7-day money-back guarantee — no hoops, no questions.`,
  },
  {
    title: "2. Eligibility for a Refund",
    body: `You are eligible for a full refund if:

- You request the refund within **7 calendar days** of your original purchase date
- Your request is submitted to **support@e-quipped.com** from the email address associated with your account

There is no minimum or maximum usage requirement. You do not need to provide a reason, though feedback is always welcome.`,
  },
  {
    title: "3. How to Request a Refund",
    body: `Send an email to **support@e-quipped.com** with the subject line "Refund Request" and include:

- The email address used to purchase
- Your Stripe payment confirmation number (found in your purchase receipt email)

We will process your refund within **5 business days** of receiving your request. Stripe will return the funds to your original payment method, typically within 5–10 business days depending on your bank.`,
  },
  {
    title: "4. After a Refund",
    body: `Once a refund is processed, your Lifetime Access will be revoked and your account will revert to the free tier. You may re-purchase at any time at the then-current price.`,
  },
  {
    title: "5. Exceptions",
    body: `Refunds will not be issued for:

- Requests made more than 7 days after the original purchase date
- Accounts suspended or terminated due to violations of our Terms of Service
- Chargebacks initiated without first contacting us — if you initiate a chargeback, we reserve the right to contest it and suspend your account

If you are experiencing a technical issue that is preventing you from accessing the Platform, please contact us at **support@e-quipped.com** before requesting a refund — we will do our best to resolve it promptly.`,
  },
  {
    title: "6. Contact",
    body: `Refund requests and billing questions: **support@e-quipped.com**

We aim to respond to all refund requests within 1 business day.`,
  },
];

export default function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Our 7-day money-back guarantee — no questions asked"
      lastUpdated="23 February 2026"
      sections={sections}
    />
  );
}
