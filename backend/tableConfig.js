// tableConfig.js
// One entry per table shown in the app's dropdown.
// Everything the UI needs - the title, the plain-English description and the
// description of every column - is defined here, so the React side never
// hard-codes a column name. seed.js also reads this file to load the CSVs.

const tables = [
  {
    key: "runs",
    number: 1,
    title: "Training runs",
    collection: "runs",
    csv: "summary.csv",
    description:
      "One row per training run cell: a training regime trained on a fixed number of " +
      "human-transcribed words. Each row is the average of 6 random seeds. This is the " +
      "raw measurement table; every other table in this app is derived from it.",
    columns: [
      { field: "arm", label: "arm", type: "string", required: true,
        description: "Training regime: scratch, synthsup, synthenc or mim." },
      { field: "n", label: "n", type: "number", required: true,
        description: "Number of human-transcribed training words (10 to 4000)." },
      { field: "n_seeds", label: "n_seeds", type: "number",
        description: "How many random seeds were averaged for this row." },
      { field: "mean_cer", label: "mean_cer", type: "number", required: true,
        description: "Mean test character error rate. Lower is better." },
      { field: "std_cer", label: "std_cer", type: "number",
        description: "Standard deviation of the CER across those seeds." },
      { field: "seed_cers", label: "seed_cers", type: "string",
        description: "The individual per-seed CER values behind the mean." }
    ]
  },
  {
    key: "cer_difference",
    number: 2,
    title: "Regime vs. scratch, at the same label count",
    collection: "cer_difference",
    csv: "cer_difference.csv",
    description:
      "Compares each pretrained regime against training from scratch on exactly the same " +
      "number of labels. A negative difference means the regime is better than scratch. " +
      "frac_arm_worse is how often the regime came out worse when the seeds are resampled, " +
      "so values near 1.00 mean the regime is reliably worse.",
    columns: [
      { field: "arm", label: "arm", type: "string", required: true,
        description: "The regime being compared against scratch." },
      { field: "n", label: "n", type: "number", required: true,
        description: "Number of transcribed training words." },
      { field: "mean_baseline", label: "mean_baseline", type: "number",
        description: "Mean CER of the scratch baseline at this label count." },
      { field: "mean_arm", label: "mean_arm", type: "number",
        description: "Mean CER of this regime at the same label count." },
      { field: "diff", label: "diff", type: "number", required: true,
        description: "mean_arm minus mean_baseline. Negative = better than scratch." },
      { field: "diff_lo", label: "diff_lo", type: "number",
        description: "Lower end of the bootstrap interval on the difference." },
      { field: "diff_hi", label: "diff_hi", type: "number",
        description: "Upper end of the bootstrap interval on the difference." },
      { field: "frac_arm_worse", label: "frac_arm_worse", type: "number",
        description: "Fraction of resamples in which this regime was worse than scratch." }
    ]
  },
  {
    key: "annotation_saving",
    number: 3,
    title: "Annotation saving at a target error",
    collection: "annotation_saving",
    csv: "annotation_saving.csv",
    description:
      "Turns the error curve into the practical question: to reach a chosen error level, " +
      "how many transcribed words does each regime need compared with training from scratch? " +
      "A label multiplier of 4.40 means scratch needs 4.40 times as many transcribed words " +
      "to reach the same error. The synthsup row at target 0.6 (10.55x) rests on the steepest, " +
      "least-sampled stretch of the curve, where N_arm is interpolated between the two " +
      "smallest measured label counts, so the target 0.5 row (4.40x) is the one to quote. " +
      "A blank row means the target was already beaten at the smallest budget measured.",
    columns: [
      { field: "arm", label: "arm", type: "string", required: true,
        description: "The regime being costed." },
      { field: "target_cer", label: "target_cer", type: "number", required: true,
        description: "The error level both regimes must reach." },
      { field: "N_baseline", label: "N_baseline", type: "number",
        description: "Words the scratch baseline needs to reach that error." },
      { field: "N_arm", label: "N_arm", type: "number",
        description: "Words this regime needs to reach the same error." },
      { field: "annotation_saving", label: "annotation_saving", type: "number",
        description: "Share of the transcription work saved (0.77 = 77 percent less)." },
      { field: "saving_lo", label: "saving_lo", type: "number",
        description: "Lower end of the interval on the saving." },
      { field: "saving_hi", label: "saving_hi", type: "number",
        description: "Upper end of the interval on the saving." },
      { field: "label_multiplier", label: "label_multiplier", type: "number",
        description: "N_baseline divided by N_arm." },
      { field: "mult_lo", label: "mult_lo", type: "number",
        description: "Lower end of the interval on the multiplier." },
      { field: "mult_hi", label: "mult_hi", type: "number",
        description: "Upper end of the interval on the multiplier." }
    ]
  },
  {
    key: "sample_complexity",
    number: 4,
    title: "Words needed to reach a target error",
    collection: "sample_complexity",
    csv: "sample_complexity.csv",
    description:
      "For each regime and each target error, the number of transcribed training words " +
      "needed to get there, read off the measured curve between measured points. A blank row " +
      "means the target was already beaten at the smallest budget measured (10 words), so " +
      "finding N would mean extrapolating below the measured range. The intervals cover seed " +
      "variation only, not test-set sampling or writer variation.",
    columns: [
      { field: "arm", label: "arm", type: "string", required: true,
        description: "Training regime." },
      { field: "target_cer", label: "target_cer", type: "number", required: true,
        description: "The error level being aimed at." },
      { field: "N", label: "N", type: "number",
        description: "Transcribed words needed to reach that error." },
      { field: "seed_lo", label: "seed_lo", type: "number",
        description: "2.5th percentile of N when the seeds are resampled." },
      { field: "seed_hi", label: "seed_hi", type: "number",
        description: "97.5th percentile of N when the seeds are resampled." },
      { field: "n_seeds_min", label: "n_seeds_min", type: "number",
        description: "Smallest number of seeds behind any point used for this estimate." }
    ]
  },
  {
    key: "segment_slopes",
    number: 5,
    title: "Per-segment slopes of the curve",
    collection: "segment_slopes",
    csv: "segment_slopes.csv",
    description:
      "How steeply error falls between each pair of neighbouring label counts, measured on " +
      "log-log axes. No curve here is a single straight line, which is why the slope is " +
      "reported segment by segment instead of as one exponent.",
    columns: [
      { field: "arm", label: "arm", type: "string", required: true,
        description: "Training regime." },
      { field: "n_from", label: "n_from", type: "number", required: true,
        description: "Label count at the start of the segment." },
      { field: "n_to", label: "n_to", type: "number", required: true,
        description: "Label count at the end of the segment." },
      { field: "loglog_slope", label: "loglog_slope", type: "number",
        description: "Slope over that segment. More negative = error falling faster." }
    ]
  },
  {
    key: "benefit_decomposition",
    number: 6,
    title: "Encoder share of the benefit",
    collection: "benefit_decomposition",
    csv: "benefit_decomposition.csv",
    description:
      "Splits the benefit of pretraining into the part carried by the encoder alone and the " +
      "part that needs the sequence model too. The share is only meaningful while the total " +
      "benefit is clearly above zero, so it is blanked from 1000 words up; the status column " +
      "says why. Read the share with care: it rises with the label count mainly because the " +
      "total benefit shrinks, not because the encoder gains. In absolute error the encoder's " +
      "benefit stays roughly flat (Table 2, synthenc rows) while the sequence model's benefit " +
      "falls away (Table 7).",
    columns: [
      { field: "n", label: "n", type: "number", required: true,
        description: "Number of transcribed training words." },
      { field: "cer_scratch", label: "cer_scratch", type: "number",
        description: "CER training from scratch." },
      { field: "cer_synthenc", label: "cer_synthenc", type: "number",
        description: "CER with only the pretrained encoder transferred." },
      { field: "cer_synthsup", label: "cer_synthsup", type: "number",
        description: "CER with the whole pretrained model transferred." },
      { field: "encoder_share", label: "encoder_share", type: "number",
        description: "Share of the total benefit attributable to the encoder." },
      { field: "share_lo", label: "share_lo", type: "number",
        description: "Lower end of the interval on the share." },
      { field: "share_hi", label: "share_hi", type: "number",
        description: "Upper end of the interval on the share." },
      { field: "status", label: "status", type: "string",
        description: "Why the share is blank, when it is." }
    ]
  },
  {
    key: "sequence_benefit",
    number: 7,
    title: "Benefit of transferring the sequence model",
    collection: "sequence_benefit",
    csv: "sequence_benefit.csv",
    description:
      "What transferring the sequence model and output head adds on top of transferring the " +
      "encoder alone, at the same label count. Positive means the full transfer is better. " +
      "The gain is large when labels are very scarce (about 0.27 to 0.32 CER between 10 and " +
      "100 words) and cannot be told apart from zero from 500 words up.",
    columns: [
      { field: "n", label: "n", type: "number", required: true,
        description: "Number of transcribed training words." },
      { field: "mean_partial", label: "mean_partial", type: "number",
        description: "CER with the encoder only." },
      { field: "mean_full", label: "mean_full", type: "number",
        description: "CER with the full model transferred." },
      { field: "diff", label: "diff", type: "number", required: true,
        description: "mean_partial minus mean_full. Positive = full transfer wins." },
      { field: "diff_lo", label: "diff_lo", type: "number",
        description: "Lower end of the interval on the difference." },
      { field: "diff_hi", label: "diff_hi", type: "number",
        description: "Upper end of the interval on the difference." },
      { field: "frac_full_better", label: "frac_full_better", type: "number",
        description: "Fraction of resamples in which the full transfer was better." }
    ]
  },
  {
    key: "per_class_errors",
    number: 8,
    title: "Errors by character class",
    collection: "per_class_errors",
    csv: "per_class_errors.csv",
    description:
      "Where the recognition errors actually land, grouped by the kind of Devanagari " +
      "character. Recall is the share of that class's reference characters the model read " +
      "correctly. Independent vowels, anusvara/visarga marks and nukta are the hardest " +
      "(recall about 0.20); consonants and vowel signs sit around 0.35 to 0.38; virama and " +
      "the 'other' class do best (about 0.52 to 0.58). The vedic_mark class has only 3 " +
      "reference characters, so its recall of 0 says very little.",
    columns: [
      { field: "class", label: "class", type: "string", required: true,
        description: "Character class, for example consonant or vowel_sign." },
      { field: "ref_count", label: "ref_count", type: "number",
        description: "How many characters of this class appear in the ground truth." },
      { field: "correct", label: "correct", type: "number",
        description: "Characters of this class recognised correctly." },
      { field: "substituted", label: "substituted", type: "number",
        description: "Read as a different character." },
      { field: "deleted", label: "deleted", type: "number",
        description: "Present in the ground truth but missing from the prediction." },
      { field: "inserted", label: "inserted", type: "number",
        description: "Predicted although not present in the ground truth." },
      { field: "recall", label: "recall", type: "number",
        description: "correct divided by ref_count." }
    ]
  },
  {
    key: "exact_matches",
    number: 9,
    title: "Zero-shot exact matches and the synthetic corpus",
    collection: "exact_matches",
    csv: "exact_matches.csv",
    description:
      "The real test words that the zero-shot model (pretrained on synthetic words and never " +
      "shown a real label) transcribed exactly right. For each one, the table says whether " +
      "that exact word also appears in the synthetic corpus. Most are false, so most of these " +
      "exact hits are not simply words the model had already seen during pretraining.",
    columns: [
      { field: "word", label: "word", type: "string", required: true,
        description: "A test word the zero-shot model got exactly right, in Devanagari script." },
      { field: "in_synth_corpus", label: "in_synth_corpus", type: "boolean",
        description: "True if this exact word also occurs in the synthetic corpus." }
    ]
  }
];

function getTable(key) {
  return tables.find(function (t) { return t.key === key; });
}

module.exports = { tables, getTable };
