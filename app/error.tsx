"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="ftco-section">
      <div className="container text-center py-5">
        <h1>Something went wrong.</h1>
        <p>The page could not finish loading. You can try again, or message the team on WhatsApp.</p>
        <button type="button" className="btn btn-quarternary mr-2" onClick={() => reset()}>Try Again</button>
        <a className="btn btn-tertiary" href="https://wa.me/254112272061">WhatsApp +254112272061</a>
      </div>
    </section>
  );
}
