"use client"

import { useMemo, useState } from "react"
import { BrainCircuit, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react"
import { model, predictAttrition, riskBand, type PredictionInput } from "@/lib/model"
import { Card, CardHeader, Field, inputClasses, Badge } from "@/components/ui/primitives"
import { fmtPct } from "@/lib/utils"

const DEFAULT: PredictionInput = {
  age: 35,
  perf: 3,
  tenure: 5,
  training: 40,
  satisfaction: 3,
  salary: 120000,
  dept: "Sales",
  education: "Bachelors",
  overtime: "Yes",
  workmode: "Onsite",
  marital: "Single",
  gender: "Male",
  promoted: "No",
}

const cats = model.cat_categories

export function PredictionView() {
  const [form, setForm] = useState<PredictionInput>(DEFAULT)
  const prob = useMemo(() => predictAttrition(form), [form])
  const band = riskBand(prob)

  const set = (patch: Partial<PredictionInput>) => setForm((f) => ({ ...f, ...patch }))

  const num = (
    label: string,
    key: keyof PredictionInput,
    min: number,
    max: number,
    step = 1,
  ) => (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={form[key] as number}
        onChange={(e) => set({ [key]: Number(e.target.value) } as Partial<PredictionInput>)}
        className={inputClasses()}
      />
    </Field>
  )

  const sel = (label: string, key: keyof PredictionInput, options: string[]) => (
    <Field label={label}>
      <select
        value={form[key] as string}
        onChange={(e) => set({ [key]: e.target.value } as Partial<PredictionInput>)}
        className={inputClasses()}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  )

  const toneMap = {
    high: { badge: "danger" as const, icon: AlertTriangle, ring: "oklch(0.65 0.2 20)" },
    medium: { badge: "warning" as const, icon: TrendingUp, ring: "oklch(0.8 0.14 80)" },
    low: { badge: "success" as const, icon: ShieldCheck, ring: "oklch(0.74 0.14 160)" },
  }
  const tone = toneMap[band.tone]
  const RiskIcon = tone.icon
  const deg = Math.round(prob * 360)

  const drivers = topDrivers(form)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader
          title="Employee Attrition Risk Predictor"
          subtitle="Adjust an employee profile to score their probability of leaving"
          action={
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <BrainCircuit style={{ width: 15, height: 15 }} />
              Logistic Regression
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3">
          {num("Age", "age", 18, 70)}
          {num("Performance Rating", "perf", 1, 5)}
          {num("Years at Company", "tenure", 0, 40, 0.1)}
          {num("Training Hours", "training", 0, 120)}
          {num("Satisfaction (1-5)", "satisfaction", 1, 5)}
          {num("Annual Salary (₹)", "salary", 20000, 400000, 1000)}
          {sel("Department", "dept", cats["Department"])}
          {sel("Education", "education", cats["EducationLevel"])}
          {sel("Overtime", "overtime", cats["OverTime"])}
          {sel("Work Mode", "workmode", cats["Work Mode"])}
          {sel("Marital Status", "marital", cats["Marital status"])}
          {sel("Gender", "gender", cats["Gender"])}
          {sel("Ever Promoted", "promoted", cats["EverPromoted"])}
        </div>
      </Card>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardHeader title="Predicted Risk" />
          <div className="flex flex-col items-center gap-4 p-6">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${tone.ring} ${deg}deg, var(--muted) ${deg}deg)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-card">
                <span className="font-mono text-3xl font-bold text-foreground">
                  {fmtPct(prob, 1)}
                </span>
                <span className="text-xs text-muted-foreground">probability</span>
              </div>
            </div>
            <Badge tone={tone.badge}>
              <RiskIcon style={{ width: 14, height: 14 }} className="mr-1" />
              {band.label}
            </Badge>
            <p className="text-center text-xs leading-relaxed text-muted-foreground text-pretty">
              {band.tone === "high"
                ? "This profile has an elevated likelihood of leaving. Consider retention actions such as workload review, recognition, or a career-path conversation."
                : band.tone === "medium"
                  ? "Moderate flight risk. Monitor engagement signals and address any satisfaction or overtime concerns early."
                  : "This employee is likely to stay. Maintain current engagement and development investment."}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Risk Drivers" subtitle="Largest contributions for this profile" />
          <ul className="flex flex-col divide-y divide-border">
            {drivers.map((d) => (
              <li key={d.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">{d.label}</span>
                <Badge tone={d.contribution > 0 ? "danger" : "success"}>
                  {d.contribution > 0 ? "↑ risk" : "↓ risk"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function topDrivers(input: PredictionInput) {
  const contribs: { label: string; contribution: number }[] = []

  const numFieldLabel: Record<string, string> = {
    Age_clean: "Age",
    PerformanceRating_clean: "Performance",
    YearsAtCompany: "Tenure",
    TrainingHoursLastYear: "Training",
    SatisfactionScore: "Satisfaction",
    "Annual Salary": "Salary",
  }
  const numFieldKey: Record<string, keyof PredictionInput> = {
    Age_clean: "age",
    PerformanceRating_clean: "perf",
    YearsAtCompany: "tenure",
    TrainingHoursLastYear: "training",
    SatisfactionScore: "satisfaction",
    "Annual Salary": "salary",
  }

  for (const feat of model.num_features) {
    const raw = input[numFieldKey[feat]] as number
    const scaled = (raw - model.scaler_mean[feat]) / model.scaler_scale[feat]
    contribs.push({
      label: numFieldLabel[feat],
      contribution: scaled * (model.coefficients[feat] ?? 0),
    })
  }

  const catFieldLabel: Record<string, string> = {
    Department: "Department",
    EducationLevel: "Education",
    OverTime: "Overtime",
    "Work Mode": "Work Mode",
    "Marital status": "Marital Status",
    Gender: "Gender",
    EverPromoted: "Promotion",
  }
  const catFieldKey: Record<string, keyof PredictionInput> = {
    Department: "dept",
    EducationLevel: "education",
    OverTime: "overtime",
    "Work Mode": "workmode",
    "Marital status": "marital",
    Gender: "gender",
    EverPromoted: "promoted",
  }

  for (const cat of model.cat_features) {
    const value = input[catFieldKey[cat]] as string
    const key = `${cat}_${value}`
    if (key in model.coefficients) {
      contribs.push({ label: catFieldLabel[cat], contribution: model.coefficients[key] })
    }
  }

  return contribs.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 5)
}
