import React from "react";
import { AbsoluteFill } from "remotion";

export interface CarouselSlideProps {
  slideIndex: number;
  totalSlides: number;
  title: string;
  slideContent: string;
  slideSubtext?: string;
  slideEmoji?: string;
  slideNumber?: string;
  brandName: string;
  brandEmoji: string;
  accentColor: string;
  secondaryColor: string;
  slideType: "cover" | "content" | "comparison" | "checklist" | "cta";
}

const LIGHT_BG = "#FAFAFA";
const DARK_TEXT = "#1a1a1a";
const MUTED_TEXT = "#666666";

function SlideDots({
  total,
  current,
  accentColor,
  light,
}: {
  total: number;
  current: number;
  accentColor: string;
  light: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 10,
        zIndex: 20,
      }}
    >
      {Array.from({ length: total }).map((_, j) => (
        <div
          key={j}
          style={{
            width: j === current ? 28 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor:
              j === current
                ? light
                  ? "#ffffff"
                  : accentColor
                : light
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </div>
  );
}

function BrandTag({
  brandName,
  light,
}: {
  brandName: string;
  light: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 22,
        fontWeight: 600,
        color: light ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
        letterSpacing: 2,
        textTransform: "uppercase",
        zIndex: 10,
      }}
    >
      {brandName}
    </div>
  );
}

function CoverSlide({
  title,
  slideContent,
  brandEmoji,
  brandName,
  accentColor,
  secondaryColor,
  slideIndex,
  totalSlides,
}: CarouselSlideProps) {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 80px 120px",
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 40 }}>{brandEmoji}</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 920,
            marginBottom: 40,
          }}
        >
          {slideContent}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 500,
          }}
        >
          Arrasta pra saber mais &rarr;
        </div>
      </div>
      <BrandTag brandName={brandName} light />
      <SlideDots total={totalSlides} current={slideIndex} accentColor={accentColor} light />
    </AbsoluteFill>
  );
}

function ContentSlide({
  slideContent,
  slideSubtext,
  slideEmoji,
  slideNumber,
  brandName,
  accentColor,
  slideIndex,
  totalSlides,
}: CarouselSlideProps) {
  const displayNumber = slideNumber || slideEmoji || "";

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: LIGHT_BG }} />
      {/* Accent bar left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: "100%",
          backgroundColor: accentColor,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 80px 140px",
          zIndex: 5,
        }}
      >
        {displayNumber && (
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "rgba(0,0,0,0.06)",
              lineHeight: 1,
              marginBottom: 10,
              position: "absolute",
              top: 60,
              left: 70,
            }}
          >
            {displayNumber}
          </div>
        )}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: DARK_TEXT,
            lineHeight: 1.25,
            maxWidth: 920,
            marginBottom: 30,
            marginTop: displayNumber ? 80 : 0,
          }}
        >
          {slideContent}
        </div>
        {slideSubtext && (
          <div
            style={{
              fontSize: 34,
              fontWeight: 400,
              color: MUTED_TEXT,
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            {slideSubtext}
          </div>
        )}
      </div>
      <BrandTag brandName={brandName} light={false} />
      <SlideDots total={totalSlides} current={slideIndex} accentColor={accentColor} light={false} />
    </AbsoluteFill>
  );
}

function ComparisonSlide({
  slideContent,
  slideSubtext,
  brandName,
  accentColor,
  slideIndex,
  totalSlides,
}: CarouselSlideProps) {
  // Parse content: look for lines with crosses and checks
  const lines = slideContent.split("\n").filter((l) => l.trim());
  const badLines = lines.filter((l) => l.startsWith("\u274C") || l.toLowerCase().includes("vs"));
  const goodLines = lines.filter((l) => l.startsWith("\u2705"));
  const otherLines = lines.filter(
    (l) => !l.startsWith("\u274C") && !l.startsWith("\u2705") && !l.toLowerCase().includes("vs")
  );

  const hasSides = badLines.length > 0 && goodLines.length > 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: LIGHT_BG }} />
      {hasSides ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            zIndex: 5,
          }}
        >
          {/* Left (bad) side */}
          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(220, 38, 38, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "80px 50px 140px",
              borderRight: "2px solid rgba(0,0,0,0.06)",
            }}
          >
            {badLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#991b1b",
                  lineHeight: 1.35,
                  marginBottom: 20,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          {/* Right (good) side */}
          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(22, 163, 74, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "80px 50px 140px",
            }}
          >
            {goodLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#166534",
                  lineHeight: 1.35,
                  marginBottom: 20,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 80px 140px",
            zIndex: 5,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: line.startsWith("\u274C")
                  ? "#991b1b"
                  : line.startsWith("\u2705")
                    ? "#166534"
                    : DARK_TEXT,
                lineHeight: 1.35,
                marginBottom: 20,
              }}
            >
              {line}
            </div>
          ))}
          {slideSubtext && (
            <div
              style={{
                fontSize: 30,
                color: MUTED_TEXT,
                marginTop: 20,
                lineHeight: 1.4,
              }}
            >
              {slideSubtext}
            </div>
          )}
        </div>
      )}
      <BrandTag brandName={brandName} light={false} />
      <SlideDots total={totalSlides} current={slideIndex} accentColor={accentColor} light={false} />
    </AbsoluteFill>
  );
}

function ChecklistSlide({
  slideContent,
  brandName,
  accentColor,
  slideIndex,
  totalSlides,
}: CarouselSlideProps) {
  const items = slideContent.split("\n").filter((l) => l.trim());

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: LIGHT_BG }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: "100%",
          backgroundColor: accentColor,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 80px 140px",
          zIndex: 5,
        }}
      >
        {items.map((item, i) => {
          const isCheck = item.includes("\u2705") || item.includes("\u2611");
          const isCross = item.includes("\u274C");
          const isUnchecked = item.includes("\u2610");
          const cleanText = item
            .replace(/^[\u2610\u2611\u2705\u274C\s]+/, "")
            .trim();

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isCheck
                    ? "rgba(22,163,74,0.15)"
                    : isCross
                      ? "rgba(220,38,38,0.15)"
                      : "rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                {isCheck ? "\u2705" : isCross ? "\u274C" : isUnchecked ? "\u2610" : "\u25A1"}
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 600,
                  color: DARK_TEXT,
                  lineHeight: 1.35,
                }}
              >
                {cleanText || item}
              </div>
            </div>
          );
        })}
      </div>
      <BrandTag brandName={brandName} light={false} />
      <SlideDots total={totalSlides} current={slideIndex} accentColor={accentColor} light={false} />
    </AbsoluteFill>
  );
}

function CTASlide({
  slideContent,
  slideSubtext,
  brandEmoji,
  brandName,
  accentColor,
  secondaryColor,
  slideIndex,
  totalSlides,
}: CarouselSlideProps) {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 80px 120px",
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 50 }}>{brandEmoji}</div>
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 860,
            marginBottom: 40,
          }}
        >
          {slideContent}
        </div>
        {slideSubtext && (
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {slideSubtext}
          </div>
        )}
      </div>
      <BrandTag brandName={brandName} light />
      <SlideDots total={totalSlides} current={slideIndex} accentColor={accentColor} light />
    </AbsoluteFill>
  );
}

export const CarouselSlide: React.FC<CarouselSlideProps> = (props) => {
  switch (props.slideType) {
    case "cover":
      return <CoverSlide {...props} />;
    case "content":
      return <ContentSlide {...props} />;
    case "comparison":
      return <ComparisonSlide {...props} />;
    case "checklist":
      return <ChecklistSlide {...props} />;
    case "cta":
      return <CTASlide {...props} />;
    default:
      return <ContentSlide {...props} />;
  }
};
