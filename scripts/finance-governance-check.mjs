#!/usr/bin/env node
import { nowId, writeJson } from './lib/governance-utils.mjs';

const request = process.argv.slice(2).join(' ') || 'No finance request provided';
const q = request.toLowerCase();
const risky = ['buy', 'sell', 'short', 'long now', 'guarantee', 'profit', 'live trading', 'leverage', 'position size', 'signal'];
const flags = risky.filter(w => q.includes(w));
const review = {
  id: nowId('finance-governance'),
  createdAt: new Date().toISOString(),
  request,
  classification: flags.length ? 'high-risk-finance-or-trading' : 'educational-or-software-support',
  flags,
  boundaries: [
    'No personalized financial advice.',
    'No profit guarantees.',
    'Use education, journaling, scenario analysis, and risk review framing.',
    'Live trading automation requires explicit human approval and controls.'
  ],
  decision: flags.length ? 'approval_or_reframe_required' : 'allowed_with_risk_context'
};
writeJson(`storage/governance/trading-finance-reviews/${review.id}.json`, review);
console.log(JSON.stringify(review, null, 2));
