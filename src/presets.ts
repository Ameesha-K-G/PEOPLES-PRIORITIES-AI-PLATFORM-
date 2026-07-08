import { PresetDemo } from "./types";

export const PRESET_DEMOS: PresetDemo[] = [
  {
    id: "chellanam-school",
    title: "School Travel Obstacle",
    category: "Chellanam Village",
    channel: "voice",
    input_text: "Our children in Chellanam village have to travel over 12km to reach the nearest higher secondary school. Many girls are dropping out after class 10 because the transport is unsafe.",
    output: {
      analysis: {
        detected_language: "English",
        standardized_english_transcript: "Our children in Chellanam village have to travel over 12km to reach the nearest higher secondary school. Many girls are dropping out after class 10 because the transport is unsafe.",
        assigned_theme: "School Upgrades",
        extracted_locations: ["Chellanam village"],
      },
      data_enrichment: {
        target_public_registry: "Educational Registry & Student Demographics",
        synthesized_planning_metric_needed: "Travel Distance vs. Local Enrollment Rate",
        target_regional_risk_factor: "Unsafe student transportation leading to gendered dropout rates",
      },
      simulated_scoring_inputs: {
        demand_intensity_dh: 0.85,
        infrastructure_gap_ig: 0.90,
        estimated_cost_cp: 0.60,
        socio_economic_disadvantage_pd: 1.25,
      },
    },
  },
  {
    id: "munnar-water",
    title: "Saline Contamination Crisis",
    category: "Munnar Ward",
    channel: "text",
    input_text: "കുടിവെള്ളമില്ലാതെ ഞങ്ങൾ വലയുന്നു. ഞങ്ങളുടെ മൂന്നാർ വാർഡിൽ ആഴ്ചയിൽ ഒരിക്കൽ മാത്രമാണ് പൈപ്പ് വെള്ളം വരുന്നത്. കിണറുകളെല്ലാം ഉപ്പുവെള്ളം കയറി നശിച്ചു.",
    output: {
      analysis: {
        detected_language: "Malayalam (മലയാളം)",
        standardized_english_transcript: "We are struggling without drinking water. In our Munnar ward, piped water comes only once a week. All our wells have been ruined by saline water intrusion.",
        assigned_theme: "Water Supply",
        extracted_locations: ["Munnar ward"],
      },
      data_enrichment: {
        target_public_registry: "Hydro-geological GIS & Water Grid Registry",
        synthesized_planning_metric_needed: "Local Pipeline Gap Index",
        target_regional_risk_factor: "Severe aquifer salinization and critical municipal rationing cycle",
      },
      simulated_scoring_inputs: {
        demand_intensity_dh: 0.95,
        infrastructure_gap_ig: 0.82,
        estimated_cost_cp: 0.30,
        socio_economic_disadvantage_pd: 1.10,
      },
    },
  },
  {
    id: "jamtara-vocational",
    title: "Youth Unemployment Density",
    category: "Jamtara Block",
    channel: "photo",
    input_text: "Our youth in Jamtara block have finished class 12 but there is no training center. They are mostly unemployed and migrate to cities for daily wage labor.",
    output: {
      analysis: {
        detected_language: "English",
        standardized_english_transcript: "Our youth in Jamtara block have finished class 12 but there is no training center. They are mostly unemployed and migrate to cities for daily wage labor.",
        assigned_theme: "Vocational Center",
        extracted_locations: ["Jamtara block"],
      },
      data_enrichment: {
        target_public_registry: "Employment & District Census Data",
        synthesized_planning_metric_needed: "Youth Unemployment Density",
        target_regional_risk_factor: "High rate of forced seasonal economic migration out of rural districts",
      },
      simulated_scoring_inputs: {
        demand_intensity_dh: 0.72,
        infrastructure_gap_ig: 0.78,
        estimated_cost_cp: 1.00,
        socio_economic_disadvantage_pd: 1.30,
      },
    },
  },
  {
    id: "daringbadi-road",
    title: "Seasonal Monsoon Isolation",
    category: "Daringbadi Village",
    channel: "voice",
    input_text: "The dirt track from Phulbani town to the hill village of Daringbadi is completely washed away in every monsoon. Medical emergency vehicles cannot reach us.",
    output: {
      analysis: {
        detected_language: "English",
        standardized_english_transcript: "The dirt track from Phulbani town to the hill village of Daringbadi is completely washed away in every monsoon. Medical emergency vehicles cannot reach us.",
        assigned_theme: "Road Connectivity",
        extracted_locations: ["Phulbani town", "Daringbadi"],
      },
      data_enrichment: {
        target_public_registry: "Satellite GIS Highway Infrastructure Maps",
        synthesized_planning_metric_needed: "Isolated Village Distance Index",
        target_regional_risk_factor: "Critical seasonal isolation causing healthcare access blackouts",
      },
      simulated_scoring_inputs: {
        demand_intensity_dh: 0.90,
        infrastructure_gap_ig: 0.95,
        estimated_cost_cp: 1.00,
        socio_economic_disadvantage_pd: 1.45,
      },
    },
  },
];
