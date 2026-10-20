"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Montserrat, Arial, sans-serif", padding: 48, textAlign: "center" }}>
        <h1>Something went wrong.</h1>
        <p>Try again, or message Phoebe Giving on WhatsApp +254112272061.</p>
        <button type="button" onClick={() => reset()}>Try Again</button>
      </body>
    </html>
  );
}
