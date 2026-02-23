/**
 * client/src/pages/policies/CookiePolicy.tsx
 */
import PolicyLayout from "./PolicyLayout";

const sections = [
  {
    title: "1. What Are Cookies?",
    body: `Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently and to provide information to site owners. Cookies cannot execute programs or deliver viruses to your device.`,
  },
  {
    title: "2. Cookies We Use",
    body: `E-Quipped: Work uses only **strictly necessary** cookies. We do not use advertising cookies, tracking pixels, or third-party analytics cookies.

| Cookie Name | Purpose | Duration | Type |
|---|---|---|---|
| session | Maintains your login state after OAuth authentication | Session (expires on browser close) | Strictly necessary |
| csrf_token | Protects against cross-site request forgery attacks | Session | Strictly necessary |
| theme | Remembers your light/dark theme preference | 1 year | Functional |

No cookie we set is shared with advertising networks or data brokers.`,
  },
  {
    title: "3. Third-Party Cookies",
    body: `When you proceed to Stripe Checkout to complete a purchase, Stripe may set its own cookies on the Stripe-hosted checkout page. These are governed by Stripe's own Cookie Policy (available at stripe.com/cookies-policy). We have no control over Stripe's cookies.`,
  },
  {
    title: "4. Managing Cookies",
    body: `Because we use only strictly necessary cookies, there is no cookie consent banner — these cookies are required for the Platform to function. You can manage or delete cookies through your browser settings at any time:

- **Chrome:** Settings → Privacy and security → Cookies and other site data
- **Firefox:** Settings → Privacy & Security → Cookies and Site Data
- **Safari:** Preferences → Privacy → Manage Website Data
- **Edge:** Settings → Cookies and site permissions

Note that disabling strictly necessary cookies will prevent you from logging in to the Platform.`,
  },
  {
    title: "5. Changes to This Policy",
    body: `If we introduce new types of cookies in the future, we will update this policy and, where required by law, obtain your consent before placing them. The "Last updated" date at the top of this page reflects when the policy was last revised.`,
  },
  {
    title: "6. Contact",
    body: `Questions about our use of cookies: **privacy@e-quipped.com**`,
  },
];

export default function CookiePolicy() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="What cookies we use and why"
      lastUpdated="23 February 2026"
      sections={sections}
    />
  );
}
