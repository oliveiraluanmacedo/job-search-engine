/**
 * Builds the provider-independent prompt for evaluating a canonical job.
 *
 * @param {object} job - Canonical job object with deterministic score fields.
 * @returns {string} Complete future LLM evaluation prompt.
 */
function preparePrompt(job) {
  const scoreBreakdown = JSON.stringify(job?.score_breakdown || {}, null, 2);

  return `Evaluate this job opportunity for overall candidate fit.

Job details:
- Title: ${formatValue(job?.title)}
- Company: ${formatValue(job?.company)}
- Location: ${formatValue(job?.location)}
- Employment type: ${formatValue(job?.employment_type)}
- Remote: ${formatValue(job?.remote)}
- Hybrid: ${formatValue(job?.hybrid)}
- Deterministic score: ${formatValue(job?.deterministic_score)}
- Score breakdown: ${scoreBreakdown}

Job description:
${formatValue(job?.description)}

Evaluate and return:
1. Overall fit score.
2. Candidate strengths for this role.
3. Candidate weaknesses for this role.
4. Missing skills or experience.
5. A recommendation decision with concise reasoning.`;
}

/**
 * Returns the standardized AI evaluation shape.
 *
 * This placeholder intentionally performs no provider call. A future provider
 * integration should obtain its request text from preparePrompt(job) and map
 * its response to this stable output structure.
 *
 * @param {object} job - Canonical job object.
 * @returns {{ai_score: number, decision: string, reasoning: string, strengths: string[], weaknesses: string[], missing_skills: string[]}} Evaluation result.
 */
function evaluateJob(job) {
  return {
    ai_score: 0,
    decision: 'Pending',
    reasoning: 'AI evaluation not implemented.',
    strengths: [],
    weaknesses: [],
    missing_skills: [],
  };
}

/**
 * Converts a prompt value to readable text while retaining false and zero.
 *
 * @param {unknown} value - Value to render.
 * @returns {string} Prompt-safe text.
 */
function formatValue(value) {
  return value === null || value === undefined || value === '' ? 'Not provided' : String(value);
}

module.exports = { preparePrompt, evaluateJob };
