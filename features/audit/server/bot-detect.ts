import 'server-only';

/**
 * Link-preview fetchers, crawlers and scanners. They load a shared link without a person looking at it,
 * so they must not count as a view or trigger the "opened your audit" email.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|fetch|scan|monitor|facebookexternalhit|facebot|whatsapp|telegram|slack|discord|linkedin|twitter|skype|embedly|quora|pinterest|reddit|vkshare|outbrain|headless|lighthouse|python-requests|python-urllib|curl|wget|httpie|go-http-client|java\/|okhttp|axios|node-fetch|undici|postmanruntime/i;

/**
 * Best-effort: a missing user agent counts as a bot, as does an explicit prefetch. This is a heuristic.
 * Some unfurlers and email scanners will slip through, so "opened" is a hint, not proof.
 */
export function isLikelyBot(headers: Pick<Headers, 'get'>): boolean {
  const userAgent = headers.get('user-agent');
  if (!userAgent) return true;
  if (BOT_PATTERN.test(userAgent)) return true;
  const purpose = `${headers.get('sec-purpose') ?? ''} ${headers.get('purpose') ?? ''}`.toLowerCase();
  return purpose.includes('prefetch') || purpose.includes('preview');
}
