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
 * Rejects jobs in excluded domains.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Domain rule result.
 */
function checkDomain(job) {
  const content = [job?.title, job?.description]
    .filter((value) => typeof value === 'string')
    .join(' ');
  const excludedDomains = /\b(Automotive|Semiconductor|Hardware|Manufacturing|Industrial)\b/i;

  if (excludedDomains.test(content)) {
    return { passed: false, reason: 'Domain' };
  }

  return { passed: true, reason: null };
}

/**
 * Rejects roles that explicitly require eight or more years of experience.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Experience rule result.
 */
function checkExperience(job) {
  const description = typeof job?.description === 'string' ? job.description : '';
  const seniorExperienceRequirement = /\b(?:8|9|[1-9]\d)\s*(?:\+\s*|plus\s*)?(?:years?|yrs?)\b(?:\s+(?:of\s+)?experience)?/i;

  if (seniorExperienceRequirement.test(description)) {
    return { passed: false, reason: 'Experience' };
  }

  return { passed: true, reason: null };
}

/**
 * Rejects incomplete descriptions and clearly placeholder job text.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Description-quality rule result.
 */
function checkDescriptionQuality(job) {
  const description = typeof job?.description === 'string' ? job.description.trim() : '';
  const meaningfulSentences = description
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 3);
  const placeholderText = /\b(?:description not available|job description coming soon|details? to follow|to be confirmed|tbd)\b/i;

  if (meaningfulSentences.length < 3 || placeholderText.test(description)) {
    return { passed: false, reason: 'Description Quality' };
  }

  return { passed: true, reason: null };
}

/**
 * Rejects known recruiter postings unless a final client is named.
 *
 * @param {object} job - Canonical job object.
 * @returns {{passed: boolean, reason: string|null}} Recruiter rule result.
 */
function checkRecruiter(job) {
  const company = typeof job?.company === 'string' ? job.company.trim() : '';
  const description = typeof job?.description === 'string' ? job.description : '';
  const recruiters = new Set(['hays', 'cpl', 'morgan mckinley']);

  if (recruiters.has(company.toLowerCase()) && !hasIdentifiedClient(description)) {
    return { passed: false, reason: 'Recruiter' };
  }

  return { passed: true, reason: null };
}

/**
 * Determines whether a recruiter description explicitly names the final client.
 *
 * @param {string} description - Canonical job description.
 * @returns {boolean} Whether a client name is present.
 */
function hasIdentifiedClient(description) {
  const namedClientPatterns = [
    /\b(?:our|the)\s+(?:end\s+)?client\s*(?:,|:|-|is)?\s*([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,5})\b/,
    /\bon behalf of\s+([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,5})\b/,
  ];

  return namedClientPatterns.some((pattern) => pattern.test(description));
}

module.exports = { filterJob };
