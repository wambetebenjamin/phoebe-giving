import Link from "next/link";

export default function PageBanner({ title, crumb }: { title: string; crumb: string }) {
  return (
    <section className="hero-wrap hero-wrap-2" style={{ backgroundImage: "url(/images/church-dar.jpg)" }}>
      <div className="overlay" />
      <div className="container">
        <div className="row no-gutters slider-text align-items-end">
          <div className="col-md-9 pb-5">
            <p className="breadcrumbs mb-2">
              <span className="mr-2"><Link href="/">Home</Link></span>
              <span>{crumb}</span>
            </p>
            <h1 className="mb-0 bread">{title}</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
