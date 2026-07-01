# Workflow Registry

The workflow registry maps repeatable task types to agents, skills, decision engines, and deliverables.

| Workflow | Category | Primary agents | Engines |
|---|---|---|---|
| `project-kickoff` | foundation | project-manager, product-manager, principal-software-architect | product-strategy-engine, architecture-engine |
| `feature-planning` | product-engineering | product-manager, principal-software-architect, senior-fullstack-engineer | product-strategy-engine, architecture-engine, testing-strategy-engine |
| `architecture-review` | engineering | principal-software-architect, cto, senior-backend-engineer | architecture-engine, database-engine, security-review-engine |
| `build-execution` | engineering | senior-fullstack-engineer, senior-frontend-engineer, senior-backend-engineer | code-review-engine, testing-strategy-engine, release-readiness-engine |
| `code-review` | engineering | code-reviewer, principal-software-architect, cybersecurity-engineer | code-review-engine, security-review-engine, performance-engine |
| `bug-investigation` | engineering | senior-fullstack-engineer, senior-backend-engineer, qa-engineer | code-review-engine, testing-strategy-engine |
| `refactor-system` | engineering | principal-software-architect, senior-fullstack-engineer, code-reviewer | architecture-engine, code-review-engine, testing-strategy-engine |
| `release-readiness` | delivery | project-manager, qa-engineer, devops-engineer | release-readiness-engine, security-review-engine, testing-strategy-engine |
| `security-review` | security | cybersecurity-engineer, principal-software-architect, legal-risk-spotter | security-review-engine, privacy-engine, legal-compliance-engine |
| `performance-audit` | engineering | senior-frontend-engineer, senior-backend-engineer, devops-engineer | performance-engine, database-engine, cloud-infrastructure-engine |
| `data-model-design` | engineering | data-engineer, senior-backend-engineer, principal-software-architect | data-model-engine, database-engine, api-design-engine |
| `api-design` | engineering | senior-backend-engineer, principal-software-architect, senior-fullstack-engineer | api-design-engine, security-review-engine, testing-strategy-engine |
| `ai-agent-build` | ai | chief-ai-officer, ai-engineer, principal-software-architect | ai-agent-design-engine, ai-safety-engine, llm-prompt-evaluation-engine |
| `rag-system-build` | ai | data-engineer, ai-engineer, research-lead | ai-agent-design-engine, llm-prompt-evaluation-engine, data-model-engine |
| `prompt-evaluation` | ai | chief-ai-officer, research-lead, technical-writer | llm-prompt-evaluation-engine, ai-safety-engine |
| `product-discovery` | product | product-manager, ux-researcher, market-researcher | product-strategy-engine, ux-research-engine, market-research-engine |
| `startup-validation` | business | entrepreneur, startup-advisor, venture-builder | startup-evaluation-engine, business-model-engine, market-research-engine |
| `business-model-design` | business | business-model-strategist, cfo, entrepreneur | business-model-engine, finance-planning-engine, growth-engine |
| `market-research` | business | market-researcher, product-manager, growth-marketer | market-research-engine, product-strategy-engine, seo-engine |
| `brand-identity` | design | senior-brand-designer, copywriter, chief-design-officer | brand-engine, naming-engine, copywriting-engine |
| `naming-system` | brand | copywriter, market-researcher, entrepreneur | naming-engine, brand-engine, market-research-engine |
| `ui-review` | design | ui-designer, ux-designer, design-systems-lead | ui-review-engine, accessibility-engine, brand-engine |
| `ux-research` | design | ux-researcher, product-manager, ux-designer | ux-research-engine, product-strategy-engine |
| `growth-experiment` | growth | growth-marketer, product-manager, data-engineer | growth-engine, copywriting-engine, product-strategy-engine |
| `seo-content` | marketing | seo-specialist, copywriter, growth-marketer | seo-engine, copywriting-engine |
| `sales-funnel` | sales | sales-strategist, copywriter, growth-marketer | sales-engine, copywriting-engine, growth-engine |
| `forex-trade-review` | trading | forex-trader, risk-manager, quant-researcher | forex-trade-review-engine, trading-risk-engine, quant-research-engine |
| `trading-system-review` | trading | quant-researcher, risk-manager, forex-trader | quant-research-engine, trading-risk-engine, forex-trade-review-engine |
| `risk-review` | finance | risk-manager, cfo, legal-risk-spotter | trading-risk-engine, finance-planning-engine, legal-compliance-engine |
| `investment-analysis` | finance | financial-analyst, portfolio-manager, risk-manager | investment-analysis-engine, finance-planning-engine, market-research-engine |
| `documentation-production` | documentation | technical-writer, principal-software-architect, product-manager | documentation-engine, code-review-engine |
| `learning-loop` | meta | research-lead, project-manager, technical-writer | documentation-engine, product-strategy-engine |
| `codex-session` | orchestration | principal-software-architect, technical-writer, project-manager | architecture-engine, documentation-engine, code-review-engine |
