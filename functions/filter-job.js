/**
 * Runs the hard-filter rule pipeline for one canonical job.
 *
 * The pipeline stops at the first failed rule.
 *
 * @param {object} job - Canonical job object.
 * @returns {{approved: boolean, rejection_reason: string|null, triggered_rules: string[]}} Filter result.
 */
function filterJob(job) {
  const rules = [
    checkSeniority,
    checkEngineering,
    checkDomain,
    checkExperience,
    checkDescriptionQuality,
    checkRecruiter,
  ];

  for (const rule of rules) {
    const result = rule(job);
    if (!result.passed) {
      return {
        approved: false,
        rejection_reason: result.reason,
        triggered_rules: [result.reason],
      };
    }
  }

  return {
    approved: true,
    rejection_reason: null,
    triggered_rules: [],
  };
}

/**
 * Rejects roles above the candidate's target seniority.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Seniority rule result.
 */
function checkSeniority(job) {
  const title = typeof job?.title === 'string' ? job.title : '';
  const rejectedSeniority = /\b(Senior|Lead|Principal|Head|Director|VP|Staff)\b/i;

  if (rejectedSeniority.test(title)) {
    return { passed: false, reason: 'Seniority' };
  }

  return { passed: true, reason: null };
}

/**
 * Rejects engineering roles outside the candidate's target profile.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Engineering rule result.
 */
function checkEngineering(job) {
  const title = typeof job?.title === 'string' ? job.title : '';
  const engineeringTerms = /\b(Software Engineer|Backend Engineer|Frontend Engineer|Full[ -]?Stack Engineer|DevOps|SRE|Site Reliability Engineer|Firmware|Embedded)\b/i;

  if (engineeringTerms.test(title)) {
    return { passed: false, reason: 'Engineering' };
  }

  return { passed: true, reason: null };
}

/**
 * Placeholder for the candidate-domain rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkDomain() {
  return { passed: true, reason: null };
}

/**
 * Placeholder for the experience rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkExperience() {
  return { passed: true, reason: null };
}

/**
 * Placeholder for the description-quality rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkDescriptionQuality() {
  return { passed: true, reason: null };
}

/**
 * Placeholder for the recruiter-posting rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkRecruiter() {
  return { passed: true, reason: null };
}

module.exports = { filterJob };
