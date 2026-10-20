"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/give", label: "Give" },
  { href: "/#about", label: "About" },
  { href: "/#campaigns", label: "Campaigns" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const role = data?.user?.role;

  return (
    <>
      <div className="wrap">
        <div className="container">
          <div className="row">
            <div className="col-md-8 d-flex align-items-center">
              <p className="mb-0 phone pl-md-2">
                <a href="tel:+254112272061" className="mr-3"><span className="fa fa-phone mr-1" /> +254 112 272 061</a>
                <a href="mailto:giving@phoebecommunity.church"><span className="fa fa-paper-plane mr-1" /> giving@phoebecommunity.church</a>
              </p>
            </div>
            <div className="col-md-4 d-flex justify-content-md-end">
              <div className="social-media">
                <p className="mb-0 d-flex">
                  <a href="https://wa.me/254112272061" className="d-flex align-items-center justify-content-center" aria-label="WhatsApp"><span className="fa fa-whatsapp" /></a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg navbar-dark ftco_navbar ftco-navbar-light" id="ftco-navbar">
        <div className="container">
          <Link className="navbar-brand" href="/">Phoebe Giving</Link>
          <button className="navbar-toggler" type="button" aria-expanded={open} aria-controls="ftco-nav" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
          <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="ftco-nav">
            <ul className="navbar-nav ml-auto">
              {LINKS.map((link) => (
                <li key={link.href} className={`nav-item ${pathname === link.href ? "active" : ""}`}>
                  <Link href={link.href} className="nav-link" onClick={() => setOpen(false)}>{link.label}</Link>
                </li>
              ))}
              {role === "member" || role === "admin" ? (
                <li className={`nav-item ${pathname.startsWith("/member") ? "active" : ""}`}>
                  <Link href="/member/dashboard" className="nav-link" onClick={() => setOpen(false)}>My giving</Link>
                </li>
              ) : null}
              {role === "admin" ? (
                <li className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}>
                  <Link href="/admin/dashboard" className="nav-link" onClick={() => setOpen(false)}>Finance</Link>
                </li>
              ) : null}
              {data?.user ? (
                <li className="nav-item">
                  <button type="button" className="nav-link btn btn-link" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
                </li>
              ) : (
                <li className={`nav-item ${pathname.startsWith("/auth") ? "active" : ""}`}>
                  <Link href="/auth/signin" className="nav-link" onClick={() => setOpen(false)}>Sign In</Link>
                </li>
              )}
              <li className="nav-item cta">
                <Link href="/give" className="nav-link" onClick={() => setOpen(false)}>Give Now</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-lg-3 mb-4">
              <h2 className="footer-heading">Phoebe Giving</h2>
              <p>Every gift tracked. Every purpose served. Online tithes and offerings for Phoebe Community Church, Nairobi.</p>
              <p><Link href="/give" className="btn btn-quarternary">Give Now</Link></p>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <h2 className="footer-heading">Funds</h2>
              <ul className="list-unstyled">
                <li><Link href="/give?fund=tithe" className="py-2 d-block">Tithe</Link></li>
                <li><Link href="/give?fund=offering" className="py-2 d-block">Offering</Link></li>
                <li><Link href="/give?fund=building" className="py-2 d-block">Building Fund</Link></li>
                <li><Link href="/give?fund=missions" className="py-2 d-block">Missions Fund</Link></li>
                <li><Link href="/give?fund=benevolence" className="py-2 d-block">Benevolence Fund</Link></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <h2 className="footer-heading">Quick Links</h2>
              <ul className="list-unstyled">
                <li><Link href="/" className="py-2 d-block">Home</Link></li>
                <li><Link href="/member/dashboard" className="py-2 d-block">Giving history</Link></li>
                <li><Link href="/legal/privacy-policy" className="py-2 d-block">Privacy policy</Link></li>
                <li><Link href="/legal/terms" className="py-2 d-block">Terms</Link></li>
                <li><Link href="/legal/cookie-policy" className="py-2 d-block">Cookie policy</Link></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3 mb-4">
              <h2 className="footer-heading">Have a question?</h2>
              <div className="block-23 mb-3">
                <ul>
                  <li><span className="icon fa fa-map" /><span className="text">Phoebe Community Church, Ngong Road, Nairobi, Kenya</span></li>
                  <li><a href="tel:+254112272061"><span className="icon fa fa-phone" /><span className="text">+254112272061</span></a></li>
                  <li><a href="mailto:giving@phoebecommunity.church"><span className="icon fa fa-paper-plane" /><span className="text">giving@phoebecommunity.church</span></a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-12 text-center">
              <p className="copyright">
                {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
                Copyright &copy; {new Date().getFullYear()} All rights reserved | This template is made with <i className="fa fa-heart" aria-hidden="true" /> by <a href="https://colorlib.com" target="_blank" rel="noreferrer">Colorlib.com</a>
                {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
