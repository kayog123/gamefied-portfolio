import 'server-only';

/**
 * GROQ for the private audits dataset. Kept as plain strings in one place so tests can run the exact
 * queries the store sends (against fake documents) without a Sanity project.
 */

/** Params: `$email` (lowercase), `$domain`. Returns the `_id` of a still-pending request, or null. */
export const PENDING_REQUEST_QUERY =
  '*[_type == "auditRequest" && status == "pending" && email == $email && domain == $domain][0]._id';

/** The request plus the report's metadata. The report itself (`reportJson`) is deliberately not here. */
export const REQUEST_FIELDS =
  '_id, _createdAt, url, domain, name, email, message, status, previewSummary, sharedFrom, ' +
  'reportGeneratedAt, reportModel, reportUsedAi, tokensUsed, reportExpiresAt, sentAt, sendError, reportError, reportStartedAt';

/** Params: `$id`. */
export const REQUEST_BY_ID_QUERY = `*[_type == "auditRequest" && _id == $id][0]{ ${REQUEST_FIELDS} }`;

/** Params: `$id`. What a run needs to decide whether it may start: the revision (for a safe compare-and-set) and its state. */
export const CLAIM_RUN_QUERY = '*[_type == "auditRequest" && _id == $id][0]{ _rev, status, reportStartedAt }';

/** Params: `$id`. The stored report itself, for the report page and for sending it. */
export const REPORT_BY_ID_QUERY =
  '*[_type == "auditRequest" && _id == $id][0]{ _id, domain, name, email, reportJson, reportExpiresAt }';

/**
 * Params: `$url`, `$since` (ISO), `$now` (ISO). The newest snapshot of this exact URL created after `$since`
 * that hasn't expired, so re-sharing a URL reuses its link instead of creating another document.
 */
export const RECENT_SNAPSHOT_QUERY =
  '*[_type == "auditSnapshot" && url == $url && dateTime(_createdAt) > dateTime($since) && dateTime(expiresAt) > dateTime($now)] | order(_createdAt desc)[0]{ shareId, expiresAt }';

/** Params: `$id` (`auditSnapshot-<shareId>`). */
export const SNAPSHOT_BY_ID_QUERY =
  '*[_type == "auditSnapshot" && _id == $id][0]{ shareId, url, domain, _createdAt, expiresAt, preparedFor, views, previewJson }';
