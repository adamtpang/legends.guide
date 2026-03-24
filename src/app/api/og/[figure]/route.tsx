import { ImageResponse } from "next/og";
import { getFigure } from "@/lib/figures";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ figure: string }> }
) {
  const { figure: figureSlug } = await params;
  const figure = getFigure(figureSlug);

  if (!figure) {
    return new Response("Figure not found", { status: 404 });
  }

  const quote =
    req.nextUrl.searchParams.get("quote") || figure.signatureQuote;
  const color = figure.color;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0C0B09",
          padding: 0,
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            backgroundColor: color,
          }}
        />

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
          }}
        >
          {/* Opening quote mark */}
          <div
            style={{
              fontSize: 160,
              color: color,
              opacity: 0.2,
              lineHeight: 0.6,
              marginBottom: 20,
            }}
          >
            {"\u201C"}
          </div>

          {/* Quote */}
          <div
            style={{
              fontSize: 36,
              color: "#F5F3EE",
              fontStyle: "italic",
              lineHeight: 1.5,
              marginBottom: 40,
            }}
          >
            {quote}
          </div>

          {/* Separator */}
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: color,
              opacity: 0.25,
              marginBottom: 24,
            }}
          />

          {/* Attribution row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 22,
                  color: color,
                  fontWeight: 600,
                  letterSpacing: 2,
                  fontFamily: "system-ui, sans-serif",
                  textTransform: "uppercase" as const,
                }}
              >
                {figure.name}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#8A8880",
                  fontFamily: "system-ui, sans-serif",
                  marginTop: 4,
                }}
              >
                {figure.era}
              </div>
            </div>

            <div
              style={{
                fontSize: 20,
                color: "#5A5850",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              legends.guide
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
