/**
 * client/src/pages/policies/PrivacyPolicy.tsx
 * GDPR / CCPA-aligned Privacy Policy for E-Quipped: Work
 */
import PolicyLayout from "./PolicyLayout";

const sections = [
  {
    title: "1. Who We Are",
    body: `E-Quipped: Work ("we", "us", "our") is an online AI-skills education platform operated by E-Quipped Ltd. Our registered address and data-controller contact is available at support@e-quipped.com. If you have any questions about how we handle your data, please reach out — we respond within 5 business days.`,
  },
  {
    title: "2. What Data We Collect",
    body: `We collect the following categories of personal data:

**Account data** — your name and email address provided through Manus OAuth when you create an account.

**Usage data** — lesson progress, quiz scores, sandbox prompt history, and XP earned. This data is used to personalise your learning experience and track your progress.

**Payment data** — when you purchase Lifetime Access, Stripe processes your payment. We store only a Stripe Customer ID and Payment Intent ID; we never see or store your card number, CVV, or full billing address.

**Technical data** — IP address, browser type, device type, and session identifiers collected automatically for security and performance purposes.

**Communications** — any messages you send to our support team.`,
  },
  {
    title: "3. How We Use Your Data",
    body: `We use your personal data to:

- Provide and personalise the E-Quipped: Work learning platform
- Process your one-time Lifetime Access purchase via Stripe
- Send transactional emails (purchase confirmation, password reset)
- Improve course content and platform features using aggregated, anonymised analytics
- Comply with legal obligations (tax records, fraud prevention)

We do **not** sell your personal data to third parties. We do not use your data for automated profiling or decisions that produce legal or similarly significant effects.`,
  },
  {
    title: "4. Legal Basis for Processing (GDPR)",
    body: `For users in the European Economic Area (EEA) and United Kingdom, our legal bases are:

- **Contract performance** — processing necessary to deliver the course you purchased
- **Legitimate interests** — security monitoring, fraud prevention, and platform analytics
- **Legal obligation** — retaining financial records as required by tax law
- **Consent** — for any optional marketing communications (you may withdraw consent at any time)`,
  },
  {
    title: "5. Cookies",
    body: `We use strictly necessary cookies to maintain your login session and remember your preferences. We do not use advertising or tracking cookies. See our Cookie Policy for full details.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your account and learning data for as long as your account is active, plus 3 years thereafter to comply with tax and legal obligations. Payment records are retained for 7 years as required by financial regulations. You may request deletion of your account at any time (see Section 8).`,
  },
  {
    title: "7. Third-Party Services",
    body: `We share data with the following trusted processors under appropriate data-processing agreements:

| Service | Purpose | Data Shared |
|---|---|---|
| Stripe | Payment processing | Email, name, Stripe IDs |
| Manus Platform | Authentication (OAuth) | Email, name, user ID |
| AWS S3 | File storage | Uploaded content |

No data is transferred outside the UK/EEA without adequate safeguards (Standard Contractual Clauses or equivalent).`,
  },
  {
    title: "8. Your Rights",
    body: `Depending on your location, you have the right to:

- **Access** — request a copy of the personal data we hold about you
- **Rectification** — ask us to correct inaccurate data
- **Erasure** — ask us to delete your account and associated data
- **Portability** — receive your data in a structured, machine-readable format
- **Objection** — object to processing based on legitimate interests
- **Restriction** — ask us to pause processing while a dispute is resolved
- **Withdraw consent** — for any consent-based processing at any time

**California residents (CCPA):** You have the right to know what personal information we collect, the right to delete it, and the right to opt out of its sale (we do not sell personal information).

To exercise any right, email us at privacy@e-quipped.com. We will respond within 30 days.`,
  },
  {
    title: "9. Data Security",
    body: `We implement industry-standard security measures including TLS encryption in transit, encrypted database storage, access controls, and regular security reviews. In the event of a data breach that affects your rights, we will notify you and the relevant supervisory authority within 72 hours as required by GDPR.`,
  },
  {
    title: "10. Children's Privacy",
    body: `E-Quipped: Work is intended for users aged 16 and over. We do not knowingly collect personal data from children under 16. If you believe a child has provided us with personal data, please contact us immediately and we will delete it.`,
  },
  {
    title: "11. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email and update the "Last updated" date below. Continued use of the platform after the effective date constitutes acceptance of the revised policy.`,
  },
  {
    title: "12. Contact & Supervisory Authority",
    body: `For privacy enquiries: **privacy@e-quipped.com**

If you are in the EEA/UK and believe we have not addressed your concern adequately, you have the right to lodge a complaint with your local data protection authority (in the UK: the Information Commissioner's Office at ico.org.uk).`,
  },
];

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal data"
      lastUpdated="23 February 2026"
      sections={sections}
    />
  );
}
