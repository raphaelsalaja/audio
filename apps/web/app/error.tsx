"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        Error
      </h1>
      <p style={{ fontSize: "15px", color: "var(--gray-10)" }}>
        Something went wrong.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          fontSize: "14px",
          fontVariationSettings: '"wght" 500',
          color: "var(--gray-12)",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          textDecorationColor: "var(--gray-a6)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Try again
      </button>
    </div>
  );
}
