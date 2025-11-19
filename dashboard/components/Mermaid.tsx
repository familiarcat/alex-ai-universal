"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type MermaidProps = {
  chart: string;
  theme?: "default" | "dark" | "neutral";
};

let globalCounter = 0;

export default function Mermaid({ chart, theme = "dark" }: MermaidProps) {
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useMemo(() => `mmd-${Date.now().toString(36)}-${globalCounter++}`, []);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      setError(null);
      try {
        // Load Mermaid from local package (installed via npm)
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        mermaid.initialize({ startOnLoad: false, theme, securityLevel: "loose" });
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Mermaid render failed");
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  return (
    <div className="mermaid-wrapper" style={{ width: "100%", overflow: "auto" }}>
      {error ? (
        <pre style={{ color: "#f87171", background: "#111827", padding: 12, borderRadius: 8 }}>
{`Mermaid error: ${error}`}
        </pre>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  );
}


