import modelJson from "./model.json"

export interface ModelDef {
  intercept: number
  coefficients: Record<string, number>
  num_features: string[]
  scaler_mean: Record<string, number>
  scaler_scale: Record<string, number>
  cat_features: string[]
  cat_categories: Record<string, string[]>
  num_medians: Record<string, number>
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1: number
    roc_auc: number
    n_train: number
    n_test: number
    n_features: number
    positive_rate_overall: number
    confusion_matrix: number[][]
  }
}

export const model = modelJson as ModelDef

// Maps model feature keys -> raw employee fields
export const NUM_FIELD_MAP: Record<string, string> = {
  Age_clean: "age",
  PerformanceRating_clean: "perf",
  YearsAtCompany: "tenure",
  TrainingHoursLastYear: "training",
  SatisfactionScore: "satisfaction",
  "Annual Salary": "salary",
}

export const CAT_FIELD_MAP: Record<string, string> = {
  Department: "dept",
  EducationLevel: "education",
  OverTime: "overtime",
  "Work Mode": "workmode",
  "Marital status": "marital",
  Gender: "gender",
  EverPromoted: "promoted",
}

export interface PredictionInput {
  age: number
  perf: number
  tenure: number
  training: number
  satisfaction: number
  salary: number
  dept: string
  education: string
  overtime: string
  workmode: string
  marital: string
  gender: string
  promoted: string
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/**
 * Reproduces the scikit-learn logistic-regression pipeline that was trained in
 * the original notebook: standard-scale the numeric features, one-hot encode the
 * categoricals with drop-first, then apply the linear model.
 */
export function predictAttrition(input: PredictionInput): number {
  let z = model.intercept

  for (const feat of model.num_features) {
    const field = NUM_FIELD_MAP[feat]
    let raw = (input as Record<string, unknown>)[field] as number
    if (raw === null || raw === undefined || Number.isNaN(raw)) {
      raw = model.num_medians[feat]
    }
    const scaled = (raw - model.scaler_mean[feat]) / model.scaler_scale[feat]
    z += scaled * (model.coefficients[feat] ?? 0)
  }

  for (const cat of model.cat_features) {
    const field = CAT_FIELD_MAP[cat]
    const value = (input as Record<string, unknown>)[field] as string
    const key = `${cat}_${value}`
    if (key in model.coefficients) {
      z += model.coefficients[key]
    }
  }

  return sigmoid(z)
}

export function riskBand(p: number): { label: string; tone: "low" | "medium" | "high" } {
  if (p >= 0.5) return { label: "High Risk", tone: "high" }
  if (p >= 0.35) return { label: "Medium Risk", tone: "medium" }
  return { label: "Low Risk", tone: "low" }
}
