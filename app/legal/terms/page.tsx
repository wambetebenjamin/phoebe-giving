import PageBanner from "@/components/PageBanner";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <PageBanner title="Terms of use" crumb="Terms" />
      <section className="ftco-section">
        <div className="container">
          <div className="col-lg-9">
            <p>These terms govern use of Phoebe Giving, the online giving platform for Phoebe Community Church in Nairobi. By giving or creating an account you agree to them.</p>
            <h2 className="h4">Gifts</h2>
            <p>A gift is a voluntary contribution to the fund you select. It is not a purchase of goods. Once confirmed, a gift is recorded against that fund. Recurring gifts continue until you pause or cancel them from your member dashboard.</p>
            <h2 className="h4">Accounts</h2>
            <p>You must give accurate contact details. New accounts receive the member role. Admin access is assigned by the church and must not be shared. You are responsible for activity under your sign in.</p>
            <h2 className="h4">Payments</h2>
            <p>M-Pesa gifts use the paybill or till shown in church settings. Card gifts are confirmed through the payment step on this site. Phoebe Giving does not ask for your M-Pesa PIN. If a payment fails at the network, the gift is not treated as received until a reference is issued.</p>
            <h2 className="h4">Acceptable use</h2>
            <p>Do not misuse the site, attempt to access another member&apos;s records, or submit false giving details. The finance team may suspend an account that appears to be used for fraud.</p>
            <h2 className="h4">Liability</h2>
            <p>The site is provided with reasonable care. We are not liable for mobile network delays, bank delays, or loss arising from incorrect phone numbers you enter. Nothing in these terms limits liability that Kenyan law does not allow us to limit.</p>
            <h2 className="h4">Contact</h2>
            <p>Questions about these terms: giving@phoebecommunity.church or WhatsApp +254112272061.</p>
          </div>
        </div>
      </section>
    </>
  );
}
