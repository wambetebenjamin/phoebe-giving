import PageBanner from "@/components/PageBanner";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageBanner title="Privacy policy" crumb="Privacy" />
      <section className="ftco-section">
        <div className="container">
          <div className="col-lg-9">
            <p>Phoebe Community Church, through Phoebe Giving, is the data controller for personal data collected on this site. This notice is written for the Kenya Data Protection Act 2019 and the Data Protection (General) Regulations.</p>
            <h2 className="h4">What we collect</h2>
            <p>When you give, we collect your name, phone number, optional email, fund, amount, frequency, payment method, and a giving reference. Members also have an account email and role. Finance admins may upload a church logo. Contact messages include the text you send.</p>
            <p>We do not store full card numbers. M-Pesa confirmations are recorded as a reference, phone number, and amount.</p>
            <h2 className="h4">Why we use it</h2>
            <p>We use this data to record gifts, issue receipts and annual statements, manage recurring giving, run campaigns, and reply to questions. The lawful bases are your consent, performance of the giving request, and the church&apos;s legitimate interest in accurate financial records.</p>
            <h2 className="h4">Sharing</h2>
            <p>Gift records are visible to the finance team. Public campaign totals and top giver initials are shown without full names. We use processors only when you configure them: Google for sign in and reCAPTCHA, Vercel for hosting, blob storage, and optional analytics, and your email host for notifications. We do not sell personal data.</p>
            <h2 className="h4">Retention and your rights</h2>
            <p>Giving records are kept for church accounting, generally seven years, unless a shorter period is required. You may ask for access, correction, deletion where the law allows, or a restriction on processing. You may withdraw cookie consent at any time by clearing site data for this browser.</p>
            <p>To make a request, write to giving@phoebecommunity.church or WhatsApp +254112272061. You may also lodge a complaint with the Office of the Data Protection Commissioner in Kenya.</p>
            <h2 className="h4">Security</h2>
            <p>Sessions are signed. Pages send security headers that block framing and sniffing. Secrets such as the reCAPTCHA secret stay on the server.</p>
          </div>
        </div>
      </section>
    </>
  );
}
