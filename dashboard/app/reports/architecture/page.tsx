import fs from "fs";
import path from "path";
import Mermaid from "@/components/Mermaid";

export default async function ArchitectureReportPage() {
  // Resolve repo-root docs path when running from dashboard/
  const repoRoot = path.resolve(process.cwd(), "..");
  const mmdPath = path.join(repoRoot, "docs", "system-architecture.mmd");

  let chart = "flowchart TD\nA[Client]-->B[n8n]\nB-->C[Supabase]"; // fallback smoke test
  try {
    if (fs.existsSync(mmdPath)) {
      chart = fs.readFileSync(mmdPath, "utf8");
    }
  } catch {}

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        System Architecture Diagram
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Source: <code>docs/system-architecture.mmd</code>
      </p>
      <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
        {/* client-side render for Mermaid */}
        <Mermaid chart={chart} theme="dark" />
      </div>
    </div>
  );
}


