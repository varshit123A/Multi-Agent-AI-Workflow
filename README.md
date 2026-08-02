# 🚀 Enterprise Multi-Agent AI Workflow Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.11%2B-cyan.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-orange.svg)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)](https://react.dev/)

An enterprise-grade, production-style AI orchestration platform designed to replace single-prompt LLM interactions with a coordinated team of autonomous, specialized AI agents. Built using **LangGraph**, **FastAPI**, **React**, and **PostgreSQL**, this platform implements continuous quality monitoring via **Ragas/DeepEval**, automated security guardrails (PII scrubbing, injection protection, schema enforcement), human-in-the-loop (HITL) approval gates, and step-by-step trace observability.

---

## 📖 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Core Agent Workflow & State Machine](#-core-agent-workflow--state-machine)
- [AI Governance, Guardrails & Evaluation](#-ai-governance-guardrails--evaluation)
- [Tech Stack](#-tech-stack)
- [Detailed Directory Layout](#-detailed-directory-layout)
- [REST & WebSocket API Specification](#-rest--websocket-api-specification)
- [Local Installation & Setup](#-local-installation--setup)
- [Production Deployment Guide](#-production-deployment-guide)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [License](#-license)

---

## 🏗️ Architectural Overview

Monolithic LLM approaches struggle with complex, multi-step enterprise problems requiring specialized domain knowledge, code execution, validation, and security auditing. This platform addresses these limitations by decomposing complex requests into an asynchronous multi-agent graph with explicit feedback loops.

```text
               ┌──────────────────────────────────────────────┐
               │         React + Tailwind Frontend            │
               │   (Live Graph Visualizer & HITL Dashboard)   │
               └──────────────────────┬───────────────────────┘
                                      │ WebSockets (Trace Logs)
                                      │ REST APIs (Control Plane)
                                      ▼
               ┌──────────────────────────────────────────────┐
               │               FastAPI Server                 │
               │     Async Middleware, CORS, DB Handlers      │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │           LangGraph State Engine             │
               │  Shared Memory Context (`AgentState`)        │
               └──────────────────────┬───────────────────────┘
                                      │
       ┌──────────────┬───────────────┼───────────────┬──────────────┐
       ▼              ▼               ▼               ▼              ▼
 ┌──────────┐   ┌──────────┐    ┌──────────┐    ┌──────────┐   ┌──────────┐
 │Supervisor│   │ Planner  │    │ Research │    │  Coding  │   │ Reviewer │
 │  Node    │   │  Agent   │    │  Agent   │    │  Agent   │   │  Agent   │
 └────┬─────┘   └────┬─────┘    └────┬─────┘    └────┬─────┘   └────┬─────┘
      │              │               │               │              │
      └──────────────┴───────────────┼───────────────┴──────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    Ragas / DeepEval Engine   │
                      │ Faithfulness & Hallucination │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    Async Guardrail Engine    │
                      │ PII Masking & Injection Shield│
                      └──────────────┬───────────────┘
                                     │
                             Confidence Router
                                     │
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
        Confidence ≥ 90%                          Confidence < 90%
  ┌───────────────────────────┐             ┌───────────────────────────┐
  │   Final System Response   │             │  Human-in-the-Loop Queue  │
  └───────────────────────────┘             └───────────────────────────┘

🔄 Core Agent Workflow & State Machine
The workflow uses an explicitly defined typed state graph (AgentState) passed between nodes:

Agent Responsibilities
Supervisor Node: Analyzes the raw request, selects execution paths, and manages context transitions.

Planner Agent: Breaks complex queries into ordered tasks and logical execution steps.

Research Agent: Conducts semantic searches across vector knowledge stores (ChromaDB) and fetches structural metadata.

Coding Agent: Produces modular backend code, unit tests, and API specs based on research context.

Reviewer Agent: Performs static analysis, flagging potential OWASP vulnerabilities, performance bottlenecks, and logic errors.

[START] ──► [Supervisor] ──► [Planner] ──► [Research] ──► [Coding] ──► [Reviewer]
                                                                            │
[END] ◄── [Final Output] ◄── [Router Gate] ◄── [Guardrails] ◄── [Evaluation] ◄┘
                                   │
                           (If Flags / Score < 90%)
                                   │
                                   ▼
                        [Human Review Approval]

[START] ──► [Supervisor] ──► [Planner] ──► [Research] ──► [Coding] ──► [Reviewer]
                                                                            │
[END] ◄── [Final Output] ◄── [Router Gate] ◄── [Guardrails] ◄── [Evaluation] ◄┘
                                   │
                           (If Flags / Score < 90%)
                                   │
                                   ▼
                        [Human Review Approval]
📂 Detailed Directory Layout
enterprise-multi-agent-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── workflows.py        # Trigger & inspect agent workflows
│   │   │       │   ├── evaluation.py       # Metrics & Ragas execution history
│   │   │       │   ├── guardrails.py       # PII logs & injection flags
│   │   │       │   └── human_review.py     # HITL approval/rejection endpoints
│   │   │       └── router.py
│   │   ├── agents/                         # Node definitions
│   │   │   ├── supervisor.py
│   │   │   ├── planner.py
│   │   │   ├── research.py
│   │   │   ├── coding.py
│   │   │   └── reviewer.py
│   │   ├── core/
│   │   │   ├── config.py                   # Environment variable parsing
│   │   │   └── database.py                 # Async PostgreSQL pool configuration
│   │   ├── eval/
│   │   │   └── metrics.py                  # Ragas / DeepEval computation logic
│   │   ├── graph/
│   │   │   ├── state.py                    # AgentState TypedDict definition
│   │   │   └── workflow.py                 # LangGraph StateGraph composition
│   │   ├── guardrails/
│   │   │   └── safety.py                   # PII masking & injection pattern checks
│   │   └── models/
│   │       └── db_models.py                # Database ORM models
│   ├── tests/                              # PyTest suite
│   ├── main.py                             # FastAPI server setup & CORS middleware
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                     # Reusable UI components
│   │   │   ├── AgentWorkflowVisualizer.tsx # Graph execution view
│   │   │   ├── EvalMetricsGrid.tsx         # Score cards & charts
│   │   │   ├── GuardrailAuditLog.tsx       # Sanitization logs
│   │   │   └── HumanReviewDrawer.tsx       # HITL review interface
│   │   ├── pages/
│   │   │   └── MainDashboard.tsx           # Primary platform application view
│   │   ├── types.ts                        # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
📡 REST & WebSocket API SpecificationREST EndpointsMethodEndpointDescriptionPOST/api/v1/workflows/runTriggers a new agent workflow task.GET/api/v1/workflows/{id}Retrieves execution state & step logs for a workflow.GET/api/v1/evaluation/metricsFetches historical Ragas / DeepEval quality trends.POST/api/v1/human-review/actionSubmits an approve, reject, or regenerate action for paused runs.GET/api/v1/guardrails/auditRetrieves sanitization, PII, and injection logs.WebSockets EndpointWS /api/v1/workflows/ws/{workflow_id}Streams live state changes, agent execution step updates, and token consumption statistics to the frontend in real time.⚙️ Local Installation & SetupPrerequisitesPython 3.11+Node.js 18+PostgreSQL Database
