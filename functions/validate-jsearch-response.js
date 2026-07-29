/**
 * Validates the unmodified payload returned by the JSearch search endpoint.
 *
 * This function performs integration-level validation only. It does not map
 * JSearch fields to the canonical job schema; that belongs to Phase 3.
 *
 * @param {unknown} response - Raw JSON body returned by JSearch.
 * @returns {object} The raw response plus validation metadata.
 * @throws {Error} When the payload is malformed or JSearch did not report success.
 */
function validateJSearchResponse(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('JSearch returned an invalid response body.');
  }

  if (response.status !== 'OK') {
    throw new Error(`JSearch request failed with status: ${String(response.status)}`);
  }

  if (!Array.isArray(response.data)) {
    throw new Error('JSearch response is missing the expected data array.');
  }

  return {
    ...response,
    validation: {
      source: 'JSearch',
      job_count: response.data.length,
      validated_at: new Date().toISOString(),
    },
  };
}

module.exports = { validateJSearchResponse };
