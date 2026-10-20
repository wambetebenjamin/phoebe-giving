import PageBanner from "@/components/PageBanner";

export const metadata = { title: "Cookie policy" };

export default function CookiePolicyPage() {
  return (
    <>
      <PageBanner title="Cookie policy" crumb="Cookies" />
      <section className="ftco-section">
        <div className="container">
          <div className="col-lg-9">
            <p>This policy explains how Phoebe Giving uses cookies and similar storage. It is written for the Kenya Data Protection Act 2019. Your choice is stored in this browser under the key phoebe_giving_consent.</p>
            <h2 className="h4">Necessary</h2>
            <p>Necessary storage keeps you signed in and remembers that you have made a cookie choice. These items are locked on because the site cannot record a gift session without them.</p>
            <h2 className="h4">Functional</h2>
            <p>Functional storage can remember fund and form choices on this device. It is off until you accept it.</p>
            <h2 className="h4">Analytics</h2>
            <p>If you allow analytics, Vercel Analytics and Speed Insights may measure page use. Gift amounts are not placed in analytics cookies. Analytics stays off until you opt in.</p>
            <h2 className="h4">Marketing</h2>
            <p>Marketing cookies are off by default. They are used only if the church later shares campaign updates that need a preference flag. You can refuse them.</p>
            <h2 className="h4">Your choice</h2>
            <p>Use Accept All or Manage Preferences on the banner. You can change your mind by clearing site data for this browser and reloading the page. For questions, contact giving@phoebecommunity.church or WhatsApp +254112272061.</p>
          </div>
        </div>
      </section>
    </>
  );
}
