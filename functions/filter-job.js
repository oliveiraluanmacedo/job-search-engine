/**
 * Runs the hard-filter rule pipeline for one canonical job.
 *
 * Rule logic is intentionally not implemented in Story 4.1. Each rule passes
 * by default, so this function currently preserves every normalized job.
 *
 * @param {object} job - Canonical job object.
 * @returns {{approved: boolean, rejection_reason: null, triggered_rules: string[]}} Filter result.
 */
function filterJob(job) {
  const results = [
    checkSeniority(job),
    checkEngineering(job),
    checkDomain(job),
    checkExperience(job),
    checkDescriptionQuality(job),
    checkRecruiter(job),
  ];

  const rejected = results.find((result) => !result.passed);

  return rejected
    ? {
      approved: false,
      rejection_reason: rejected.reason,
      triggered_rules: [],
    }
    : {
      approved: true,
      rejection_reason: null,
      triggered_rules: [],
    };
}

/**
 * Placeholder for the PRD seniority rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkSeniority() {
  return { passed: true, reason: null };
}

/**
 * Placeholder for the engineering-role rule.
 *
 * @returns {{passed: boolean, reason: null}} Passing placeholder result.
 */
function checkEngineering() {
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
