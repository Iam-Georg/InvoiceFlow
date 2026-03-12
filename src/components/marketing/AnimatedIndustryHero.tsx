"use client";

import { useEffect, useState } from "react";

const ROTATING_WORDS = ["Fotografen", "Entwickler", "Designer", "Coaches", "Berater"];

export default function AnimatedIndustryHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        padding: "100px 24px 60px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 800,
          color: "var(--text-1)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "18px",
        }}
      >
        Faktura für{" "}
        <span
          key={index}
          style={{
            color: "var(--accent)",
            display: "inline-block",
            animation: "fadeInUp 500ms var(--ease-out) forwards",
          }}
        >
          {ROTATING_WORDS[index]}
        </span>
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.7,
          color: "var(--text-2)",
          maxWidth: "560px",
          margin: "0 auto 32px",
        }}
      >
        Egal ob du Fotos machst, Code schreibst oder berätst — Faktura passt sich
        deiner Arbeit an. Finde heraus, wie andere in deiner Branche schneller
        bezahlt werden.
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-3)",
          fontWeight: 500,
        }}
      >
        Bereits{" "}
        <span style={{ color: "var(--accent)", fontWeight: 700 }}>12.000+</span>{" "}
        Freelancer nutzen Faktura
      </p>
    </section>
  );
}
