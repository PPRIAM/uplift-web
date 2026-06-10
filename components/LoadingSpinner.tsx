/**
 * LoadingSpinner - Composant de chargement Premium UPLIFT 2.0
 *
 * Variantes :
 *   "spinner"  - Double anneau rotatif avec dégradé cobalt / ardoise (par défaut)
 *   "dots"     - Trois points rebondissants utilisant les couleurs cobalt et ardoise
 *   "skeleton" - Lignes de chargement fantômes (shimmer) s'adaptant au thème
 *
 * Tailles :
 *   "sm"  - Utilisation compacte (spinner 20px / points 6px)
 *   "md"  - Cartes et sections (spinner 40px / points 10px)
 *   "lg"  - Pleine page et héros (spinner 64px / points 14px)
 */

import React from "react";

type SpinnerVariant = "spinner" | "dots" | "skeleton";
type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  // Style visuel du chargeur
  variant?: SpinnerVariant;
  // Taille du chargeur
  size?: SpinnerSize;
  // Texte d'accessibilité (ou étiquette affichée sous le spinner)
  label?: string;
  // Si vrai, affiche une superposition fixe plein écran avec flou
  fullPage?: boolean;
  // Nombre de lignes de squelette (pour variant="skeleton")
  lines?: number;
  // Classe CSS supplémentaire transmise au conteneur externe
  className?: string;
}

const SPINNER_SIZE: Record<SpinnerSize, number> = { sm: 20, md: 40, lg: 64 };
const DOT_SIZE: Record<SpinnerSize, number> = { sm: 6, md: 10, lg: 14 };
const SKELETON_HEIGHT: Record<SpinnerSize, number> = { sm: 12, md: 18, lg: 24 };

// Sous-composant pour l'anneau rotatif (Spinner)
function SpinnerRings({ size }: { size: SpinnerSize }) {
  const px = SPINNER_SIZE[size];
  const stroke = Math.max(2, Math.round(px * 0.1));
  const inner = px * 0.62;

  return (
    <div role="status" style={{ position: "relative", width: px, height: px, flexShrink: 0 }}>
      {/* Anneau extérieur - rotation horaire (Bleu Cobalt) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, rgba(14, 26, 212, 0) 0%, rgba(14, 26, 212, 0.5) 40%, #0E1AD4 70%, rgba(14, 26, 212, 0) 100%)`,
          animation: "uplift-spin-outer 1.1s linear infinite",
        }}
      />
      {/* Disque masque central */}
      <div
        style={{
          position: "absolute",
          top: stroke,
          left: stroke,
          right: stroke,
          bottom: stroke,
          borderRadius: "50%",
          background: "#FFFFFF",
        }}
      />
      {/* Anneau intérieur - contre-rotation (Ardoise) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: inner,
          height: inner,
          marginTop: -(inner / 2),
          marginLeft: -(inner / 2),
          borderRadius: "50%",
          border: `${stroke}px solid transparent`,
          borderTopColor: "#64748B",
          borderRightColor: "#334155",
          animation: "uplift-spin-inner 0.8s linear infinite",
        }}
      />
      {/* Halo de pulsation */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "1.5px solid rgba(14, 26, 212, 0.15)",
          animation: "uplift-pulse-ring 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// Sous-composant pour les points rebondissants (Dots)
function DotsLoader({ size }: { size: SpinnerSize }) {
  const dotPx = DOT_SIZE[size];
  const delays = ["0s", "0.16s", "0.32s"];
  return (
    <div role="status" style={{ display: "flex", gap: dotPx * 0.8, alignItems: "center" }}>
      {delays.map((delay, i) => (
        <div
          key={i}
          style={{
            width: dotPx,
            height: dotPx,
            borderRadius: "50%",
            background: i === 1 ? "#0E1AD4" : "#64748B",
            opacity: i === 1 ? 1 : 0.65,
            animation: `uplift-dot-bounce 1.2s ease-in-out ${delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Sous-composant pour le squelette fantôme (Skeleton)
function SkeletonLoader({ lines, size }: { lines: number; size: SpinnerSize }) {
  const h = SKELETON_HEIGHT[size];
  return (
    <div role="status" aria-label="Chargement..." style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer bg-slate-200"
          style={{ 
            height: h, 
            width: i === lines - 1 ? "68%" : i % 2 === 0 ? "100%" : "88%",
            borderRadius: "6px",
            opacity: 0.15
          }}
        />
      ))}
    </div>
  );
}

export default function LoadingSpinner({
  variant = "spinner",
  size = "md",
  label,
  fullPage = false,
  lines = 3,
  className = "",
}: LoadingSpinnerProps) {
  const inner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", gap: 12 }}>
      {variant === "spinner" && <SpinnerRings size={size} />}
      {variant === "dots" && <DotsLoader size={size} />}
      {variant === "skeleton" && <SkeletonLoader lines={lines} size={size} />}

      {label && variant !== "skeleton" && (
        <span
          style={{
            fontSize: size === "sm" ? 11 : size === "lg" ? 15 : 13,
            color: "#64748B",
            fontFamily: "var(--font-body), sans-serif",
            fontWeight: 600,
            letterSpacing: "0.04em",
            userSelect: "none",
          }}
        >
          {label}
        </span>
      )}
      {!label && <span className="sr-only">Chargement...</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className={`fixed inset-0 z-[50] flex items-center justify-center bg-[#F8FAFC]/80 backdrop-blur-md ${className}`}
        aria-live="polite"
        aria-busy="true"
      >
        {inner}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: "inline-flex" }} aria-live="polite" aria-busy="true">
      {inner}
    </div>
  );
}
