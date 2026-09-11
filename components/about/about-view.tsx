"use client"

import {
  BrainCircuit,
  BarChart3,
  Database,
  Workflow,
  Target,
  ShieldCheck,
} from "lucide-react"
import { model } from "@/lib/model"
import { Card, CardHeader } from "@/components/ui/primitives"
import { fmtInt, fmtPct } from "@/lib/utils"

export function AboutView() {
  const m = model.metrics
  const steps = [
    {
      icon: Database,
      title: "Data Foundation",
      body: "A workforce dataset of thousands of employee records spanning demographics, compensation, tenure, satisfaction, work mode, and attrition outcomes powers every view.",
    },
    {
      icon: Workflow,
      title: "Feature Engineering",
      body: "Numeric fields are cleaned and standardized; categorical attributes are one-hot encoded (drop-first) to build a model-ready feature matrix.",
    },
    {
      icon: BrainCircuit,
      title: "Predictive Modeling",
      body: "A regularized Logistic Regression model estimates each employee's probability of attrition, chosen for its interpretability and calibrated probabilities.",
    },
    {
      icon: BarChart3,
      title: "Business Intelligence",
      body: "Interactive dashboards translate predictions into department, geography, and segment-level insight so HR teams can act before talent walks out the door.",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="relative border-b border-border bg-gradient-to-br from-primary/10 via-card to-card p-8">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <Target style={{ width: 15, height: 15 }} />
            Hybrid ML + BI Platform
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground text-balance">
            Turning workforce data into proactive retention decisions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Attrition IQ combines a machine-learning risk engine with rich business-intelligence
            dashboards. Instead of reacting to resignations, HR and people-analytics teams can
            identify at-risk employees and the systemic drivers behind churn, then intervene early.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            ["Employees Analyzed", fmtInt(m.n_train + m.n_test)],
            ["Model Accuracy", fmtPct(m.accuracy)],
            ["ROC AUC", fmtPct(m.roc_auc)],
            ["Baseline Attrition", fmtPct(m.positive_rate_overall)],
          ].map(([label, value]) => (
            <div key={label} className="bg-card p-5">
              <p className="font-mono text-2xl font-semibold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {steps.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon style={{ width: 20, height: 20 }} />
                </span>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {s.body}
              </p>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader
          title="How to use this platform"
          subtitle="Four connected workspaces, one retention workflow"
        />
        <ol className="flex flex-col divide-y divide-border">
          {[
            ["Dashboard", "Slice attrition across departments, cities, age bands, satisfaction, overtime, and work mode using the global filter bar."],
            ["Risk Predictor", "Score any employee profile in real time and review the top drivers pushing their risk up or down."],
            ["Model Performance", "Inspect accuracy, precision/recall, the confusion matrix, and feature importance to trust the predictions."],
            ["Data Explorer", "Search, sort, and export the underlying employee records that feed the analytics."],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4 px-5 py-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <ShieldCheck style={{ width: 14, height: 14 }} className="text-success" />
          All computation runs client-side in your browser — no employee data leaves the page.
        </div>
      </Card>
    </div>
  )
}
