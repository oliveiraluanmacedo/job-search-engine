/**
 * Normalizes one JSearch job record into the canonical job schema.
 *
 * The source record is retained unchanged in `raw_source`. This function does
 * not filter, score, deduplicate, evaluate, or persist jobs.
 *
 * @param {object} job - A single object from the JSearch response `data` array.
 * @returns {object} A canonical job object.
 * @throws {Error} When a mandatory canonical field is unavailable.
 */
function normalizeJSearchJob(job) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) {
    throw new Error('A JSearch job must be an object.');
  }

  const title = normalizeText(job.job_title);
  const company = normalizeText(job.employer_name);
  const description = normalizeMultilineText(job.job_description);
  const applyUrl = normalizeText(job.job_apply_link);
  const remote = job.job_is_remote === true;
  const location = buildLocation(job, remote);

  assertMandatoryFields({ title, company, location, description, apply_url: applyUrl });

  const qualifications = getHighlightValues(job, 'Qualifications');
  const skills = uniqueStrings(job.job_required_skills);
  const benefitValues = uniqueStrings([
    ...toArray(job.job_benefits),
    ...getHighlightValues(job, 'Benefits'),
  ]);

  return {
    job_id: `${title}|${company}`.toLowerCase(),
    title,
    company,
    location,
    country: normalizeText(job.job_country),
    remote,
    hybrid: isHybrid(job),
    employment_type: normalizeEmploymentType(job.job_employment_type),
    seniority: null,
    salary: firstNumber(job.job_min_salary, job.job_max_salary),
    currency: normalizeText(job.job_salary_currency),
    description,
    requirements: normalizeMultilineText(qualifications.join('\n')) || normalizeText(skills.join(', ')),
    benefits: normalizeMultilineText(benefitValues.join('\n')),
    technologies: skills,
    industry: null,
    keywords: skills,
    company_size: null,
    posted_at: normalizePostedAt(job),
    apply_url: applyUrl,
    source: 'JSearch',
    language: normalizeText(job.job_language) || 'en',
    raw_source: job,
  };
}

/**
 * Converts a provider value to a trimmed single-line string or null.
 *
 * @param {unknown} value - Source value.
 * @returns {string|null} Normalized text.
 */
function normalizeText(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || null;
}

/**
 * Trims text while retaining meaningful description line breaks.
 *
 * @param {unknown} value - Source value.
 * @returns {string|null} Normalized multiline text.
 */
function normalizeMultilineText(value) {
  if (typeof value !== 'string') return null;
  const normalized = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
  return normalized || null;
}

/**
 * Builds JSearch's human-readable location from available location fields.
 *
 * @param {object} job - JSearch job record.
 * @param {boolean} remote - Whether JSearch reports a fully remote role.
 * @returns {string|null} Location text.
 */
function buildLocation(job, remote) {
  const directLocation = normalizeText(job.job_location);
  if (directLocation) return directLocation;

  const location = uniqueStrings([job.job_city, job.job_state, job.job_country]).join(', ');
  return location || (remote ? 'Remote' : null);
}

/**
 * Maps JSearch employment codes to the canonical allowed values.
 *
 * @param {unknown} value - JSearch employment type.
 * @returns {string} Canonical employment type.
 */
function normalizeEmploymentType(value) {
  const type = normalizeText(value)?.toUpperCase().replace(/[\s_-]/g, '');
  const types = {
    FULLTIME: 'Full-time',
    PARTTIME: 'Part-time',
    CONTRACTOR: 'Contract',
    CONTRACT: 'Contract',
    PERMANENT: 'Full-time',
    TEMPORARY: 'Temporary',
    INTERN: 'Internship',
    INTERNSHIP: 'Internship',
  };
  return types[type] || 'Unknown';
}

/**
 * Determines whether JSearch explicitly describes the role as hybrid.
 *
 * @param {object} job - JSearch job record.
 * @returns {boolean} Whether the role is hybrid.
 */
function isHybrid(job) {
  return /\bhybrid\b/i.test([
    job.job_title,
    job.job_location,
    job.job_description,
  ].filter((value) => typeof value === 'string').join(' '));
}

/**
 * Returns de-duplicated, normalized strings while retaining first occurrence order.
 *
 * @param {unknown[]} values - Source values.
 * @returns {string[]} Unique strings.
 */
function uniqueStrings(values) {
  const seen = new Set();
  return toArray(values).flatMap(toArray)
    .map(normalizeText)
    .filter((value) => {
      if (!value || seen.has(value.toLowerCase())) return false;
      seen.add(value.toLowerCase());
      return true;
    });
}

/**
 * Wraps a value in an array, treating nullish values as empty.
 *
 * @param {unknown} value - Source value.
 * @returns {unknown[]} Array representation.
 */
function toArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Retrieves a named JSearch highlight list.
 *
 * @param {object} job - JSearch job record.
 * @param {string} name - Highlight group name.
 * @returns {string[]} Highlight values.
 */
function getHighlightValues(job, name) {
  return toArray(job.job_highlights?.[name]);
}

/**
 * Returns the first finite numeric value, or null.
 *
 * @param {...unknown} values - Candidate number values.
 * @returns {number|null} First valid number.
 */
function firstNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

/**
 * Converts JSearch's posting date to ISO-8601 when it can be parsed.
 *
 * @param {object} job - JSearch job record.
 * @returns {string|null} ISO-8601 timestamp or null.
 */
function normalizePostedAt(job) {
  const value = job.job_posted_at_datetime_utc ?? job.job_posted_at_timestamp ?? job.job_posted_at;
  if (value === null || value === undefined || value === '') return null;

  const numericValue = Number(value);
  const date = typeof value === 'number' || /^\d+$/.test(String(value))
    ? new Date(numericValue > 1e12 ? numericValue : numericValue * 1000)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Enforces canonical required fields.
 *
 * @param {Record<string, string|null>} fields - Canonical mandatory fields.
 * @throws {Error} When one or more fields are missing.
 */
function assertMandatoryFields(fields) {
  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`JSearch job is missing mandatory field(s): ${missing.join(', ')}.`);
  }
}

module.exports = { normalizeJSearchJob };
