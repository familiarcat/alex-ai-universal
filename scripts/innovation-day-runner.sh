#!/usr/bin/env bash
set -euo pipefail

# Innovation Day Runner (dry-run friendly)
# - Reads config and emits a plan file under crew-memories/active/
# - Actual web/LLM calls are left to a separate execution agent to respect budgets

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

cfg="$ROOT/scripts/innovation-day.config.json"
if [[ ! -f "$cfg" ]]; then echo "Missing config: $cfg" >&2; exit 1; fi

timestamp=$(date -u +%Y-%m-%dT%H%M%SZ)
mkdir -p crew-memories/active
out="crew-memories/active/innovation-day-plan-${timestamp}.json"

node - <<'NODE' > "$out"
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('scripts/innovation-day.config.json', 'utf8'));
const now = new Date().toISOString();
const crew = ["picard","data","geordi","worf","crusher","riker","troi","uhura","quark"];
const plan = {
  id: `INNOVATION_DAY_${now.replace(/[:.]/g,'-')}`,
  timestamp: now,
  durationMinutes: cfg.durationMinutes,
  budgetUsdPerCrew: cfg.budgetUsdPerCrew,
  models: cfg.openrouter.models,
  assignments: crew.map(name => ({
    crew: name,
    topics: cfg.topics[name] || [],
    budgetUsd: cfg.budgetUsdPerCrew,
    note: "Leverage reputable sources: docs, RFCs, papers, high-signal talks."
  })),
  collaboration: {
    method: "parallel-research + dynamic cross-reviews",
    syncEveryMinutes: 15,
    deliverables: [
      "Top 5 findings per crew with sources",
      "1 actionable proposal per crew",
      "Cross-crew synthesis summary"
    ]
  },
  storage: {
    rag: "supabase",
    location: "crew-memories/active + milestones/"
  }
};
process.stdout.write(JSON.stringify(plan, null, 2));
NODE

echo "✅ Innovation Day plan -> $out"


