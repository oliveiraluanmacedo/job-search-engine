/**
 * Calculates deterministic opportunity scores for one canonical job.
 *
 * Scores are additive and each applied rule is recorded in the breakdown.
 * This function does not filter, rank, or mutate the supplied job object.
 *
 * @param {object} job - Canonical job object.
 * @returns {{deterministic_score: number, score_breakdown: Record<string, number>}} Score result.
 */
function scoreJob(job) {
  let deterministicScore = 0;
  const scoreBreakdown = {};

  if (job?.remote === true) {
    deterministicScore += 10;
    scoreBreakdown.remote = 10;
  }

  if (job?.hybrid === true) {
    deterministicScore += 5;
    scoreBreakdown.hybrid = 5;
  }

  const countryScore = getCountryScore(job?.country);
  if (countryScore > 0) {
    deterministicScore += countryScore;
    scoreBreakdown.country = countryScore;
  }

  return {
    deterministic_score: deterministicScore,
    score_breakdown: scoreBreakdown,
  };
}

/**
 * Returns the deterministic score associated with an accepted country value.
 *
 * @param {unknown} country - Canonical job country.
 * @returns {number} Country score, or zero when no rule applies.
 */
function getCountryScore(country) {
  if (typeof country !== 'string') return 0;

  const scores = {
    ireland: 20,
    'united kingdom': 15,
    remote: 10,
  };

  return scores[country.trim().toLowerCase()] || 0;
}

module.exports = { scoreJob };
