#!/usr/bin/env node
const request = process.argv.slice(2).join(' ').toLowerCase();
const risky = [];
if (/delete|remove|rm -rf|drop table|destroy/.test(request)) risky.push('destructive action');
if (/send email|forward email|invite|calendar/.test(request)) risky.push('external communication');
if (/secret|token|password|credential/.test(request)) risky.push('secret exposure risk');
if (/trade|broker|buy|sell order|execute/.test(request)) risky.push('financial execution risk');
console.log(`Tool boundary check: ${request || '(empty request)'}`);
if (!risky.length) console.log('Result: green/yellow zone. Proceed with normal preflight.');
else {
  console.log('Result: approval required or blocked.');
  for (const r of risky) console.log(`- ${r}`);
}
console.log('\nReference: packages/tool-contracts/boundaries/approval-matrix.md');
