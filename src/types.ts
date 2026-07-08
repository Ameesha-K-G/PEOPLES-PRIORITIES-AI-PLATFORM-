export interface SynthesisAnalysis {
  detected_language: string;
  standardized_english_transcript: string;
  assigned_theme: string;
  extracted_locations: string[];
}

export interface DataEnrichment {
  target_public_registry: string;
  synthesized_planning_metric_needed: string;
  target_regional_risk_factor: string;
}

export interface SimulatedScoringInputs {
  demand_intensity_dh: number;
  infrastructure_gap_ig: number;
  estimated_cost_cp: number;
  socio_economic_disadvantage_pd: number;
}

export interface SynthesisOutput {
  analysis: SynthesisAnalysis;
  data_enrichment: DataEnrichment;
  simulated_scoring_inputs: SimulatedScoringInputs;
}

export interface PresetDemo {
  id: string;
  title: string;
  category: string;
  input_text: string;
  channel: "voice" | "text" | "photo";
  output: SynthesisOutput;
}
