const axios = require('axios');
const cheerio = require('cheerio');

const MAX_CHARS = 15000;

// Basic SSRF protection: localhost / private network blocked
const isPrivateHost = (hostname) =>
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|\[?::1\]?)/i.test(
    hostname
  );

const validateUrl = (input) => {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    const err = new Error('Invalid URL');
    err.status = 400;
    throw err;
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || isPrivateHost(parsed.hostname)) {
    const err = new Error('This URL is not allowed');
    err.status = 400;
    throw err;
  }
  return parsed.toString();
};

const scrapeUrl = async (input) => {
  const url = validateUrl(input);

  let html;
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      maxContentLength: 3 * 1024 * 1024,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NotesBot/1.0)' },
    });
    html = res.data;
  } catch (e) {
    const err = new Error('Could not fetch the page. Check the link and try again.');
    err.status = 400;
    throw err;
  }

  const $ = cheerio.load(html);
  $('script, style, noscript, nav, footer, header, aside, form, iframe, svg').remove();

  const root = $('article').length ? $('article') : $('main').length ? $('main') : $('body');
  const text = root.text().replace(/\s+/g, ' ').trim();

  if (text.length < 100) {
    const err = new Error('Not enough readable text found on this page');
    err.status = 422;
    throw err;
  }

  return { text: text.slice(0, MAX_CHARS), pageTitle: $('title').first().text().trim() };
};

module.exports = { scrapeUrl };
