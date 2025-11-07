'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const MEMORY_ALPHA_BASE_URL = process.env.MEMORY_ALPHA_BASE_URL ||
  'https://memory-alpha.fandom.com/wiki';

async function fetchIdentitySnippet(crew) {
  const sourceUrl = `${MEMORY_ALPHA_BASE_URL}/${crew.slug}`;

  try {
    const response = await axios.get(sourceUrl, {
      headers: {
        'User-Agent': 'Alex-AI-Memory-Sync/1.0 (+https://alex-ai-universal)'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const candidateSelectors = [
      '#mw-content-text > div.mw-parser-output > p',
      '.portable-infobox .pi-data-value',
      '.portable-infobox .pi-data',
      '.portable-infobox'
    ];

    let snippet = null;

    for (const selector of candidateSelectors) {
      const element = $(selector).filter(function filterMeaningful() {
        const text = $(this).text().replace(/\s+/g, ' ').trim();
        return text.length > 60;
      }).first();

      if (element && element.length) {
        snippet = element.text();
        break;
      }
    }

    if (!snippet) {
      const fallback = $('#mw-content-text p').filter(function filterParagraph() {
        const text = $(this).text().replace(/\s+/g, ' ').trim();
        return text.length > 40;
      }).first();

      snippet = fallback.text();
    }

    if (!snippet) {
      return { snippet: null, warning: `No identity snippet found for ${crew.name}`, sourceUrl };
    }

    return {
      snippet: snippet.replace(/\s+/g, ' ').trim(),
      sourceUrl
    };
  } catch (error) {
    return {
      snippet: null,
      warning: `Failed to fetch Memory Alpha page for ${crew.name}: ${error.message}`,
      sourceUrl
    };
  }
}

module.exports = {
  fetchIdentitySnippet
};

