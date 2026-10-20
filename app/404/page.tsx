import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function MissingPage() {
  return (
    <section className="ftco-section">
      <div className="container text-center py-5">
        <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="Giving hand">
          <circle cx="48" cy="48" r="46" fill="#fff5ed" stroke="#18a577" strokeWidth="2" />
          <path d="M28 46c0-6 8-14 20-14s20 8 20 14v6c0 14-8 24-20 24S28 66 28 52v-6z" fill="#4c7bcb" />
          <path d="M36 34c2-8 8-12 12-12s8 4 8 10" fill="none" stroke="#18a577" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <h1 className="mt-4">This page does not exist.</h1>
        <p>The link may be old, or the page may have moved.</p>
        <Link href="/" className="btn btn-quarternary">Back to Home</Link>
      </div>
    </section>
  );
}
