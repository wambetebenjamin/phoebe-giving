import Link from "next/link";
import CountUp from "@/components/CountUp";
import ProgressFill from "@/components/ProgressFill";
import ContactForm from "@/components/ContactForm";
import { daysRemaining, kes, percent } from "@/lib/format";
import { readStore } from "@/lib/store";

const FUNDS = [
  { id: "tithe", title: "Tithe", text: "A steady gift for ministry, teaching, and the care of Phoebe Community Church.", icon: "flaticon-piggy-bank" },
  { id: "offering", title: "Offering", text: "A free gift toward Sunday worship, music, and hospitality for every guest.", icon: "flaticon-donation" },
  { id: "building", title: "Building Fund", text: "Help repair the sanctuary roof and keep classrooms dry through the rains.", icon: "flaticon-university" },
  { id: "missions", title: "Missions Fund", text: "Travel and teaching support for partner congregations across East Africa.", icon: "flaticon-volunteer" },
  { id: "benevolence", title: "Benevolence Fund", text: "Quiet help with food, rent, and medical needs named by the care team.", icon: "flaticon-bread" },
];

const STEPS = [
  { title: "Choose a fund", text: "Pick tithe, offering, building, missions, or benevolence." },
  { title: "Enter an amount", text: "Give once, weekly, or monthly. Quick amounts start at KES 500." },
  { title: "Pay with M-Pesa or card", text: "Confirm an M-Pesa prompt on your phone, or pay by card." },
  { title: "Receive a receipt", text: "A reference and PDF receipt arrive as soon as the gift is recorded." },
];

const STORIES = [
  { name: "Grace Wanjiku", role: "Member", quote: "I used to miss the offering bag when I travelled. Now I give from the matatu and the receipt is in my email before I reach home." },
  { name: "Peter Kamau", role: "Member", quote: "The building fund bar shows what has been raised. I can see the roof project moving, not just hope the money landed somewhere." },
  { name: "Faith Chebet", role: "Member", quote: "Monthly giving means I do not have to remember cash on Sunday. The statement at year end is ready for my records." },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();
  const active = store.campaigns.filter((item) => item.status === "active");
  const yearTotal = store.gifts
    .filter((gift) => new Date(gift.createdAt).getUTCFullYear() === 2026)
    .reduce((sum, gift) => sum + gift.amount, 0);

  return (
    <>
      <section className="hero-wrap" style={{ backgroundImage: "url(/images/worship-burundi.jpg)", height: 640 }}>
        <div className="overlay" />
        <div className="container h-100">
          <div className="row no-gutters slider-text align-items-center" style={{ height: 640 }}>
            <div className="col-md-10 col-lg-7">
              <div className="text w-100">
                <p className="subheading mb-2">Phoebe Community Church</p>
                <h1 className="mb-3" style={{ color: "#fff" }}>Every gift tracked. Every purpose served.</h1>
                <p className="mb-4" style={{ color: "#fff" }}>Give your tithe, offering, or campaign gift online. Pay with M-Pesa or card and receive an instant receipt.</p>
                <div className="d-flex flex-wrap" style={{ gap: 12 }}>
                  <Link href="/give" className="btn btn-quarternary py-3 px-4">Give Now</Link>
                  <Link href="/auth/signin" className="btn btn-tertiary py-3 px-4">Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center pb-4">
            <div className="col-md-8 heading-section text-center">
              <span className="subheading">Giving options</span>
              <h2>Choose where your gift goes</h2>
            </div>
          </div>
          <div className="row">
            {FUNDS.map((fund) => (
              <div className="col-md-6 col-lg-4 mb-4" key={fund.id}>
                <div className="fund-card p-4">
                  <span className={fund.icon} aria-hidden="true" />
                  <h3 className="h4 mt-3">{fund.title}</h3>
                  <p>{fund.text}</p>
                  <Link href={`/give?fund=${fund.id}`} className="btn btn-quarternary">Give Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ftco-section bg-light" id="how">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4">
              <img src="/images/member-kenya.jpg" alt="A young man outside a church in Rungiri, Kenya" className="img-fluid" style={{ borderRadius: 12 }} />
            </div>
            <div className="col-lg-7">
              <div className="heading-section">
                <span className="subheading">How online giving works</span>
                <h2>Four calm steps, then a receipt</h2>
              </div>
              <div className="row">
                {STEPS.map((step, index) => (
                  <div className="col-md-6 mb-3" key={step.title}>
                    <div className="p-3 h-100" style={{ background: "#fff", borderRadius: 12 }}>
                      <strong style={{ color: "#4c7bcb" }}>{index + 1}.</strong>
                      <h3 className="h5 mt-2">{step.title}</h3>
                      <p className="mb-0">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section" id="about">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="heading-section">
                <span className="subheading">About the church</span>
                <h2>Phoebe Community Church</h2>
                <p>
                  Phoebe Community Church is a neighbourhood congregation on Ngong Road in Nairobi. We gather for worship, teach children and young people, and walk with households through ordinary weeks and hard ones. Online giving lets members and guests support that work from a phone, with a record the finance team can trust.
                </p>
                <p>
                  Gifts stay assigned to the fund you choose. The finance team can see totals, campaigns, and statements without mixing tithe with benevolence or missions.
                </p>
              </div>
              <div className="row">
                <div className="col-sm-6 mb-3">
                  <div className="kpi-card">
                    <p className="mb-1 text-muted">Recorded this year</p>
                    <h3 className="mb-0"><CountUp value={yearTotal} prefix="KES " /></h3>
                  </div>
                </div>
                <div className="col-sm-6 mb-3">
                  <div className="kpi-card">
                    <p className="mb-1 text-muted">Active campaigns</p>
                    <h3 className="mb-0"><CountUp value={active.length} /></h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <img src="/images/church-dar.jpg" alt="Church building in Dar es Salaam, Tanzania" className="img-fluid" style={{ borderRadius: 12 }} />
              <p className="small text-muted mt-2">Photo: Alex Levis, Pexels licence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section bg-light" id="campaigns">
        <div className="container">
          <div className="row justify-content-center pb-4">
            <div className="col-md-8 heading-section text-center">
              <span className="subheading">Campaigns</span>
              <h2>Upcoming and active giving campaigns</h2>
            </div>
          </div>
          <div className="row">
            {active.map((campaign) => {
              const ratio = percent(campaign.raised, campaign.target);
              return (
                <div className="col-md-4 mb-4" key={campaign.id}>
                  <div className="causes text-center p-3 h-100" style={{ background: "#fff", borderRadius: 12 }}>
                    <div className="text p-2">
                      <h3 className="h4">{campaign.title}</h3>
                      <p>{campaign.description}</p>
                      <p className="mb-2"><span>{kes(campaign.raised)}</span> raised of {kes(campaign.target)}</p>
                      <ProgressFill value={ratio} />
                      <p className="mt-2 mb-3">{ratio}% · {daysRemaining(campaign.endDate)} days remaining</p>
                      <Link href={`/give?fund=${campaign.fund}`} className="btn btn-light w-100">Give Now</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center pb-4">
            <div className="col-md-8 heading-section text-center">
              <span className="subheading">Members</span>
              <h2>Why they give online</h2>
            </div>
          </div>
          <div className="row">
            {STORIES.map((story) => (
              <div className="col-md-4 mb-4" key={story.name}>
                <div className="panel h-100">
                  <p>&ldquo;{story.quote}&rdquo;</p>
                  <h3 className="h5 mb-0">{story.name}</h3>
                  <span className="text-muted">{story.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ftco-section bg-light" id="contact">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 mb-4">
              <div className="heading-section">
                <span className="subheading">Contact</span>
                <h2>Set up giving for your church</h2>
                <p>Write to the Phoebe Giving team, or chat on WhatsApp at +254112272061.</p>
              </div>
              <img src="/images/church-rustic.jpg" alt="Traditional African church with a carved wooden door" className="img-fluid" style={{ borderRadius: 12 }} />
            </div>
            <div className="col-lg-7">
              <div className="panel">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
