/**
 * client/src/pages/policies/TermsOfService.tsx
 */
import PolicyLayout from "./PolicyLayout";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using E-Quipped: Work (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Platform. These Terms apply to all visitors, registered users, and purchasers.`,
  },
  {
    title: "2. Description of Service",
    body: `E-Quipped: Work is an online AI-skills education platform that provides structured video lessons, interactive quizzes, an AI sandbox, and progress tracking. We offer a one-time Lifetime Access purchase that grants you perpetual access to all current and future course modules.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least 16 years old to use the Platform. By using the Platform, you represent that you meet this requirement. If you are using the Platform on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.`,
  },
  {
    title: "4. Account Registration",
    body: `You must create an account via Manus OAuth to access course content. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at equippedbyxixvi@gmail.com if you suspect unauthorised access.`,
  },
  {
    title: "5. Purchases and Payment",
    body: `**Lifetime Access** is available for a one-time payment of $675 USD, processed securely by Stripe. All prices are in USD and inclusive of any applicable taxes unless stated otherwise.

Upon successful payment, you receive immediate, perpetual access to all current modules and all future modules added to the Platform at no additional charge.

We reserve the right to change pricing for new customers at any time. Your Lifetime Access price is locked at the amount you paid.`,
  },
  {
    title: "6. Refund Policy",
    body: `We offer a **7-day money-back guarantee**. If you are not satisfied with the Platform for any reason, email us at equippedbyxixvi@gmail.com within 7 days of your purchase date and we will issue a full refund. No questions asked. See our Refund Policy for full details.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All course content, including text, videos, images, quizzes, and code examples, is owned by or licensed to E-Quipped Ltd and is protected by copyright and other intellectual property laws.

Your Lifetime Access licence is **personal and non-transferable**. You may not:

- Share, resell, or sublicence your account or access credentials
- Reproduce, distribute, or publicly display course content without prior written permission
- Use course content to train AI models or create competing products
- Reverse-engineer or scrape the Platform

You retain ownership of any original work you create using skills learned on the Platform.`,
  },
  {
    title: "8. Acceptable Use",
    body: `You agree not to use the Platform to:

- Violate any applicable law or regulation
- Harass, abuse, or harm other users
- Upload or transmit malicious code, spam, or unlawful content
- Attempt to gain unauthorised access to any part of the Platform or its infrastructure
- Use automated tools to scrape, crawl, or extract content at scale

We reserve the right to suspend or terminate accounts that violate these rules without notice or refund.`,
  },
  {
    title: "9. AI Sandbox",
    body: `The AI sandbox is provided for educational purposes. Prompts you submit are processed by third-party AI providers. Do not submit personal data, confidential business information, or unlawful content to the sandbox. We are not responsible for AI-generated outputs and they do not constitute professional advice.`,
  },
  {
    title: "10. Disclaimers",
    body: `The Platform is provided "as is" and "as available". We make no warranties, express or implied, regarding the accuracy, completeness, or fitness for a particular purpose of any content. Results from applying AI skills vary by individual, industry, and context — we do not guarantee specific career or business outcomes.`,
  },
  {
    title: "11. Limitation of Liability",
    body: `To the maximum extent permitted by law, E-Quipped Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "12. Governing Law",
    body: `These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory consumer protection laws in your jurisdiction provide otherwise.`,
  },
  {
    title: "13. Changes to These Terms",
    body: `We may update these Terms from time to time. Material changes will be communicated by email and by updating the "Last updated" date. Continued use of the Platform after the effective date constitutes acceptance of the revised Terms.`,
  },
  {
    title: "14. Contact",
    body: `For questions about these Terms, contact us at **equippedbyxixvi@gmail.com**.`,
  },
];

export default function TermsOfService() {
  return (
    <PolicyLayout
      title="Terms of Service"
      subtitle="The rules and conditions governing your use of E-Quipped: Work"
      lastUpdated="23 February 2026"
      sections={sections}
    />
  );
}
