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
 * Evaluates a canonical job with the OpenAI Chat Completions API.
 *
 * Any API, network, parsing, or schema-validation failure returns the stable
 * fallback shape so downstream processing can continue safely.
 *
 * @param {object} job - Canonical job object.
 * @returns {Promise<{ai_score: number, decision: string, reasoning: string, strengths: string[], weaknesses: string[], missing_skills: string[]}>} Evaluation result.
 */
async function evaluateJob(job) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return createFallbackEvaluation();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Return only a valid JSON object with exactly these fields: ai_score (number), decision (string), reasoning (string), strengths (array of strings), weaknesses (array of strings), missing_skills (array of strings).',
          },
          {
            role: 'user',
            content: preparePrompt(job),
          },
        ],
      }),
    });

    if (!response.ok) {
      return createFallbackEvaluation();
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const evaluation = JSON.parse(content);

    return isValidEvaluation(evaluation) ? evaluation : createFallbackEvaluation();
  } catch {
    return createFallbackEvaluation();
  }
}

/**
 * Validates the exact AI evaluation response contract.
 *
 * @param {unknown} evaluation - Parsed provider response.
 * @returns {boolean} Whether the response matches the expected shape.
 */
function isValidEvaluation(evaluation) {
  if (!evaluation || typeof evaluation !== 'object' || Array.isArray(evaluation)) return false;

  const expectedKeys = ['ai_score', 'decision', 'reasoning', 'strengths', 'weaknesses', 'missing_skills'];
  const keys = Object.keys(evaluation);
  if (keys.length !== expectedKeys.length || keys.some((key) => !expectedKeys.includes(key))) return false;

  return Number.isFinite(evaluation.ai_score)
    && typeof evaluation.decision === 'string'
    && typeof evaluation.reasoning === 'string'
    && areStrings(evaluation.strengths)
    && areStrings(evaluation.weaknesses)
    && areStrings(evaluation.missing_skills);
}

/**
 * Checks whether a provider field is an array of strings.
 *
 * @param {unknown} value - Provider response value.
 * @returns {boolean} Whether the value is a string array.
 */
function areStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Creates the standard evaluation result used when an AI request fails.
 *
 * @returns {{ai_score: number, decision: string, reasoning: string, strengths: string[], weaknesses: string[], missing_skills: string[]}} Fallback evaluation.
 */
function createFallbackEvaluation() {
  return {
    ai_score: 0,
    decision: 'Error',
    reasoning: 'AI evaluation failed.',
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
