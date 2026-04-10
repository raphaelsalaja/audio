"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
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
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#111",
            }}
          >
            Error
          </h1>
          <p style={{ fontSize: "15px", color: "#666" }}>
            Something went wrong.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#111",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
