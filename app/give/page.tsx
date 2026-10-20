import { Suspense } from "react";
import GivingForm from "@/components/GivingForm";
import PageBanner from "@/components/PageBanner";

export const metadata = { title: "Give" };

export default function GivePage() {
  return (
    <>
      <PageBanner title="Give now" crumb="Give" />
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="panel">
                <p className="subheading">Phoebe Community Church</p>
                <h2 className="h3 mb-3">A gift with a clear purpose</h2>
                <Suspense fallback={<p>Loading the giving form.</p>}>
                  <GivingForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
