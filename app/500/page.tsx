"use client";

export default function ServerErrorPage() {
  return (
    <section className="ftco-section">
      <div className="container text-center py-5">
        <h1>Something went wrong.</h1>
        <p>Please try again. If it continues, message the team on WhatsApp.</p>
        <a className="btn btn-quarternary mr-2" href="/">Try Again</a>
        <a className="btn btn-tertiary" href="https://wa.me/254112272061">WhatsApp +254112272061</a>
      </div>
    </section>
  );
}
