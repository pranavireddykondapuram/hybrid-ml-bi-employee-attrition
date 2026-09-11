"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { model } from "@/lib/model"
import { Card, CardHeader } from "@/components/ui/primitives"
import { fmtInt, fmtPct } from "@/lib/utils"

const COLORS = {
  primary: "oklch(0.74 0.13 190)",
  danger: "oklch(0.65 0.2 20)",
  accent: "oklch(0.8 0.14 80)",
  success: "oklch(0.74 0.14 160)",
  grid: "oklch(0.3 0.015 252)",
  text: "oklch(0.68 0.012 252)",
}

export function ModelView() {
  const m = model.metrics
  const metricCards = [
    { label: "Accuracy", value: fmtPct(m.accuracy), tone: "text-primary" },
    { label: "Precision", value: fmtPct(m.precision), tone: "text-accent" },
    { label: "Recall", value: fmtPct(m.recall), tone: "text-success" },
    { label: "F1 Score", value: fmtPct(m.f1), tone: "text-foreground" },
    { label: "ROC AUC", value: fmtPct(m.roc_auc), tone: "text-primary" },
  ]

  const cm = m.confusion_matrix
  const cmCells = [
    { label: "True Negative", value: cm[0][0], desc: "Stayed · predicted stay", tone: "success" },
    { label: "False Positive", value: cm[0][1], desc: "Stayed · predicted leave", tone: "warning" },
    { label: "False Negative", value: cm[1][0], desc: "Left · predicted stay", tone: "danger" },
    { label: "True Positive", value: cm[1][1], desc: "Left · predicted leave", tone: "primary" },
  ] as const

  // Feature importance = absolute coefficient magnitude
  const importance = Object.entries(model.coefficients)
    .map(([k, v]) => ({ name: prettyFeature(k), value: +Math.abs(v).toFixed(3), raw: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {metricCards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
            <p className={`mt-2 font-mono text-2xl font-semibold ${c.tone}`}>{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Confusion Matrix"
            subtitle={`Evaluated on ${fmtInt(m.n_test)} held-out employees`}
          />
          <div className="grid grid-cols-2 gap-3 p-5">
            {cmCells.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">
                  {fmtInt(c.value)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Model Overview" subtitle="Training configuration & data split" />
          <dl className="flex flex-col divide-y divide-border px-5">
            {[
              ["Algorithm", "Logistic Regression (L2)"],
              ["Training samples", fmtInt(m.n_train)],
              ["Test samples", fmtInt(m.n_test)],
              ["Total features", `${m.n_features} (after encoding)`],
              ["Baseline attrition rate", fmtPct(m.positive_rate_overall)],
              ["Preprocessing", "StandardScaler + One-Hot (drop-first)"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="font-mono text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Feature Importance"
          subtitle="Absolute logistic-regression coefficient magnitude (standardized inputs)"
        />
        <div className="h-96 px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={importance}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 4, left: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.text, fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: COLORS.text, fontSize: 11 }}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "oklch(0.26 0.015 252 / 0.4)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {importance.map((d, i) => (
                  <Cell key={i} fill={d.raw > 0 ? COLORS.danger : COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: COLORS.danger }} />
            Increases attrition risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: COLORS.primary }} />
            Decreases attrition risk
          </span>
        </div>
      </Card>
    </div>
  )
}

function prettyFeature(k: string): string {
  const map: Record<string, string> = {
    Age_clean: "Age",
    PerformanceRating_clean: "Performance",
    YearsAtCompany: "Tenure",
    TrainingHoursLastYear: "Training Hrs",
    SatisfactionScore: "Satisfaction",
    "Annual Salary": "Salary",
  }
  if (map[k]) return map[k]
  return k.replace(/_/g, " ").replace("Marital status", "Marital")
}
