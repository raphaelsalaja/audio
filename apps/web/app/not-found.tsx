import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        gap: "16px",
        padding: "48px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontVariationSettings: '"wght" 700',
          color: "var(--gray-12)",
        }}
      >
        404
      </h1>
      <p style={{ fontSize: "15px", color: "var(--gray-10)" }}>
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          fontSize: "14px",
          fontVariationSettings: '"wght" 500',
          color: "var(--gray-12)",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          textDecorationColor: "var(--gray-a6)",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
