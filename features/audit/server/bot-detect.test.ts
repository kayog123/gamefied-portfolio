import { describe, expect, it } from 'vitest';
import { isLikelyBot } from './bot-detect';

const headers = (init: Record<string, string>) => new Headers(init);

describe('isLikelyBot', () => {
  it.each([
    ['Slack unfurl', 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
    ['WhatsApp preview', 'WhatsApp/2.23.20.0 A'],
    ['Facebook / Messenger', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
    ['LinkedIn', 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)'],
    ['X / Twitter', 'Twitterbot/1.0'],
    ['Discord', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'],
    ['Telegram', 'TelegramBot (like TwitterBot)'],
    ['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['Lighthouse', 'Mozilla/5.0 (Linux; Android 11) Chrome-Lighthouse'],
    ['curl', 'curl/8.4.0'],
    ['python', 'python-requests/2.31.0'],
    ['headless Chrome', 'Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36'],
  ])('treats %s as a bot', (_label, userAgent) => {
    expect(isLikelyBot(headers({ 'user-agent': userAgent }))).toBe(true);
  });

  it.each([
    ['Chrome on Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'],
    ['Safari on iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'],
    ['Firefox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'],
    ['Edge', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'],
  ])('treats %s as a person', (_label, userAgent) => {
    expect(isLikelyBot(headers({ 'user-agent': userAgent }))).toBe(false);
  });

  it('treats a missing user agent as a bot', () => {
    expect(isLikelyBot(headers({}))).toBe(true);
  });

  it('treats an explicit prefetch as a bot even with a browser user agent', () => {
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    expect(isLikelyBot(headers({ 'user-agent': chrome, 'sec-purpose': 'prefetch' }))).toBe(true);
    expect(isLikelyBot(headers({ 'user-agent': chrome, purpose: 'preview' }))).toBe(true);
  });
});
