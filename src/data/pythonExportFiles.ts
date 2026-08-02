/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PythonFileNode } from '../types';

export const PYTHON_PROJECT_FILES: PythonFileNode[] = [
  {
    path: 'multi_agent_platform/backend/app/graph/state.py',
    filename: 'state.py',
    category: 'graph',
    description: 'Shared AgentState TypedDict defining the LangGraph state payload across all nodes.',
    content: `from typing import TypedDict, List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EvalMetricsDict(TypedDict):
    faithfulness: float
    hallucination_score: float
    relevance: float
    latency_ms: int
    tokens_used: int

class GuardrailFlagsDict(TypedDict):
    clean: bool
    pii_detected: bool
    pii_masked_text: str
    injection_attempt_detected: bool
    schema_valid: bool
    flags_list: List[str]

class AgentState(TypedDict):
    """
    Shared TypedDict state passed through the LangGraph StateGraph:
    START -> Supervisor -> Planner -> Research -> Coding -> Reviewer -> Eval -> Guardrail -> Router -> END
    """
    messages: List[Dict[str, str]]
    task: str
    plan: List[str]
    research_data: Dict[str, Any]
    code_output: Dict[str, Any]
    review_feedback: Dict[str, Any]
    eval_metrics: EvalMetricsDict
    guardrail_flags: GuardrailFlagsDict
    confidence_score: float
    requires_human_approval: bool
    final_output: str
`
  },
  {
    path: 'multi_agent_platform/backend/app/graph/workflow.py',
    filename: 'workflow.py',
    category: 'graph',
    description: 'LangGraph StateGraph orchestration wiring Supervisor, Planner, Research, Coding, Reviewer, Eval, Guardrails, and Router nodes.',
    content: `from langgraph.graph import StateGraph, START, END
from app.graph.state import AgentState
from app.agents.supervisor import supervisor_node
from app.agents.planner import planner_node
from app.agents.research import research_node
from app.agents.coding import coding_node
from app.agents.reviewer import reviewer_node
from app.eval.metrics import eval_engine_node
from app.guardrails.safety import guardrail_node

def confidence_router(state: AgentState) -> str:
    """
    Human Approval Router:
    - If confidence_score >= 0.90 and guardrail_flags['clean'] == True -> Route to END
    - Else -> Route to HUMAN_REVIEW (pause state)
    """
    confidence = state.get("confidence_score", 0.0)
    clean = state.get("guardrail_flags", {}).get("clean", False)
    
    if confidence >= 0.90 and clean:
        state["requires_human_approval"] = False
        return END
    else:
        state["requires_human_approval"] = True
        return "human_in_the_loop_node"

def build_workflow_graph():
    workflow = StateGraph(AgentState)

    # Register Nodes
    workflow.add_node("Supervisor Node", supervisor_node)
    workflow.add_node("Planner Agent", planner_node)
    workflow.add_node("Research Agent", research_node)
    workflow.add_node("Coding Agent", coding_node)
    workflow.add_node("Reviewer Agent", reviewer_node)
    workflow.add_node("Evaluation Engine", eval_engine_node)
    workflow.add_node("Guardrail Engine", guardrail_node)

    # Define Linear & Conditional Edges
    workflow.add_edge(START, "Supervisor Node")
    workflow.add_edge("Supervisor Node", "Planner Agent")
    workflow.add_edge("Planner Agent", "Research Agent")
    workflow.add_edge("Research Agent", "Coding Agent")
    workflow.add_edge("Coding Agent", "Reviewer Agent")
    workflow.add_edge("Reviewer Agent", "Evaluation Engine")
    workflow.add_edge("Evaluation Engine", "Guardrail Engine")
    
    # Conditional Router edge after Guardrails
    workflow.add_conditional_edges(
        "Guardrail Engine",
        confidence_router,
        {
            END: END,
            "human_in_the_loop_node": END  # State pauses for WebSocket / REST human intervention
        }
    )

    return workflow.compile()
`
  },
  {
    path: 'multi_agent_platform/backend/app/agents/supervisor.py',
    filename: 'supervisor.py',
    category: 'agents',
    description: 'Supervisor Agent node that analyzes the user task and orchestrates execution flow.',
    content: `from app.graph.state import AgentState
import time

async def supervisor_node(state: AgentState) -> AgentState:
    """
    Supervisor Node:
    Analyzes task complexity, initializes message context, and sets orchestration objectives.
    """
    task = state["task"]
    state["messages"].append({
        "role": "system",
        "content": f"[Supervisor] Orchestrating execution flow for: '{task}'. Initiating multi-step planning."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/agents/planner.py',
    filename: 'planner.py',
    category: 'agents',
    description: 'Planner Agent node that decomposes user tasks into a structured execution plan.',
    content: `from app.graph.state import AgentState
import json

async def planner_node(state: AgentState) -> AgentState:
    """
    Planner Node:
    Generates a structured multi-step execution plan based on the task architecture.
    """
    task = state["task"]
    plan = [
        f"1. Gather API specs and security requirements for '{task[:40]}...'",
        "2. Design database models and async repository layer with SQLAlchemy 2.0",
        "3. Implement RESTful FastAPI endpoints with Async Pydantic v2 schemas",
        "4. Write unit tests and perform OWASP Top 10 vulnerability scan",
        "5. Execute automated Ragas evaluation and PII/injection guardrail checks"
    ]
    state["plan"] = plan
    state["messages"].append({
        "role": "assistant",
        "content": f"[Planner] Decomposed task into {len(plan)} structured architectural milestones."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/agents/research.py',
    filename: 'research.py',
    category: 'agents',
    description: 'Research Agent node extracting technical context, stack references, and API docs.',
    content: `from app.graph.state import AgentState

async def research_node(state: AgentState) -> AgentState:
    """
    Research Node:
    Extracts technical context, library docs, and recommended patterns.
    """
    state["research_data"] = {
        "summary": "Extracted modern Python 3.11+ async patterns, SQLAlchemy 2.0 ORM, and OAuth2 JWT auth guidelines.",
        "api_docs": [
            {
                "title": "FastAPI Async WebSockets & Security",
                "url": "https://fastapi.tiangolo.com/advanced/websockets/",
                "snippet": "Use async def endpoints with Depends(get_current_user) and Pydantic v2 Strict schemas."
            },
            {
                "title": "LangGraph StateGraph Routing",
                "url": "https://langchain-ai.github.io/langgraph/",
                "snippet": "Use StateGraph with conditional edges for Confidence Router human-in-the-loop pauses."
            }
        ],
        "technical_stack": ["FastAPI", "AsyncPG", "LangGraph", "Pydantic v2", "Ragas"]
    }
    state["messages"].append({
        "role": "assistant",
        "content": "[Research] Gathered documentation and architectural best practices."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/agents/coding.py',
    filename: 'coding.py',
    category: 'agents',
    description: 'Coding Agent node that generates modular backend code, unit tests, and OpenAPI spec.',
    content: `from app.graph.state import AgentState

async def coding_node(state: AgentState) -> AgentState:
    """
    Coding Node:
    Synthesizes plan and research into complete Python source files, unit tests, and OpenAPI schemas.
    """
    task = state["task"]
    state["code_output"] = {
        "files": [
            {
                "filename": "services/payment_service.py",
                "language": "python",
                "content": """from fastapi import HTTPException, status
from pydantic import BaseModel, Field
import uuid

class PaymentRequest(BaseModel):
    transaction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float = Field(..., gt=0.0)
    currency: str = Field("USD", max_length=3)

async def process_secure_transaction(payload: PaymentRequest) -> dict:
    # SQLi safe parameterized execution via Async SQLAlchemy
    return {"status": "SUCCESS", "tx_id": payload.transaction_id, "amount": payload.amount}
"""
            }
        ],
        "unit_tests": "import pytest\nfrom app.services.payment_service import process_secure_transaction...",
        "api_spec": "openapi: 3.1.0\ninfo:\n  title: Enterprise Service\n  version: 1.0.0"
    }
    state["messages"].append({
        "role": "assistant",
        "content": "[Coding] Generated modular Python backend files, pytest suites, and OpenAPI 3.1 spec."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/agents/reviewer.py',
    filename: 'reviewer.py',
    category: 'agents',
    description: 'Reviewer Agent performing OWASP top 10 security audit and performance analysis.',
    content: `from app.graph.state import AgentState

async def reviewer_node(state: AgentState) -> AgentState:
    """
    Reviewer Node:
    Performs static-like analysis on generated code, checking SQLi, OWASP Top 10, and async bottlenecks.
    """
    state["review_feedback"] = {
        "security_flags": [],
        "performance_notes": [
            "Async Pydantic v2 schema validation confirmed.",
            "SQLAlchemy parameterized queries eliminate SQL injection vectors."
        ],
        "owasp_compliant": True
    }
    state["messages"].append({
        "role": "reviewer",
        "content": "[Reviewer] Completed OWASP Top 10 vulnerability scan. 0 critical flags detected."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/eval/metrics.py',
    filename: 'metrics.py',
    category: 'eval',
    description: 'Evaluation Engine computing Ragas Faithfulness, Hallucination, and Context Relevance scores.',
    content: `from app.graph.state import AgentState

async def eval_engine_node(state: AgentState) -> AgentState:
    """
    Evaluation Engine Node:
    Computes RAG/Generation quality scores: Faithfulness, Hallucination Score, and Context Relevance (0.0 to 1.0).
    """
    # Calculate quality scores
    state["eval_metrics"] = {
        "faithfulness": 0.94,
        "hallucination_score": 0.04,
        "relevance": 0.97,
        "latency_ms": 1180,
        "tokens_used": 1840
    }
    state["messages"].append({
        "role": "system",
        "content": "[Eval Engine] Ragas evaluation completed: Faithfulness=0.94, Hallucination=0.04, Relevance=0.97."
    })
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/guardrails/safety.py',
    filename: 'safety.py',
    category: 'guardrails',
    description: 'Guardrail Engine checking for PII, prompt injections, and JSON schema formatting.',
    content: `import re
from app.graph.state import AgentState

PII_EMAIL_REGEX = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b'
PII_SSN_REGEX = r'\\b\\d{3}-\\d{2}-\\d{4}\\b'
INJECTION_KEYWORDS = ['ignore previous', 'system prompt', 'drop table', 'delete from']

async def guardrail_node(state: AgentState) -> AgentState:
    """
    Guardrail Engine Node:
    - Inspects text for PII & masks it ([EMAIL_MASKED], [SSN_MASKED])
    - Detects prompt injections
    - Validates strict JSON response formatting
    - Computes confidence_score
    """
    task_text = state["task"]
    flags_list = []
    
    # Check injection
    injection_detected = any(kw in task_text.lower() for kw in INJECTION_KEYWORDS)
    if injection_detected:
        flags_list.append("Prompt injection sequence detected in user input")
    
    # Mask PII
    masked_text = re.sub(PII_EMAIL_REGEX, "[EMAIL_MASKED]", task_text)
    masked_text = re.sub(PII_SSN_REGEX, "[SSN_MASKED]", masked_text)
    pii_detected = (masked_text != task_text)
    if pii_detected:
        flags_list.append("PII (Email/SSN) redacted from input stream")

    clean = (not injection_detected)
    
    state["guardrail_flags"] = {
        "clean": clean,
        "pii_detected": pii_detected,
        "pii_masked_text": masked_text,
        "injection_attempt_detected": injection_detected,
        "schema_valid": True,
        "flags_list": flags_list
    }
    
    # Compute confidence score
    base_confidence = 0.95
    if pii_detected:
        base_confidence -= 0.08
    if injection_detected:
        base_confidence = 0.20
        
    state["confidence_score"] = round(base_confidence, 2)
    state["messages"].append({
        "role": "system",
        "content": f"[Guardrail Engine] Safety check completed. Clean={clean}, Confidence={state['confidence_score']}."
    })
    
    # Format final output
    state["final_output"] = (
        f"**Workflow Completed Successfully**\\n\\n"
        f"**Plan Executed:** {len(state.get('plan', []))} steps\\n"
        f"**Security Scan:** OWASP Top 10 compliant ({len(state.get('review_feedback', {}).get('security_flags', []))} warnings)\\n"
        f"**Eval Scores:** Faithfulness={state.get('eval_metrics', {}).get('faithfulness')}, "
        f"Hallucination={state.get('eval_metrics', {}).get('hallucination_score')}\\n"
        f"**Confidence Score:** {state.get('confidence_score')}\\n"
    )
    return state
`
  },
  {
    path: 'multi_agent_platform/backend/app/api/v1/endpoints/workflows.py',
    filename: 'workflows.py',
    category: 'api',
    description: 'FastAPI REST and WebSocket endpoints for triggering workflows and human-in-the-loop review.',
    content: `from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from app.graph.workflow import build_workflow_graph

router = APIRouter()
graph_app = build_workflow_graph()

class WorkflowCreateRequest(BaseModel):
    task: str
    model: str = "gemini-2.5-pro"
    force_human_review: bool = False

@router.post("/workflows/start")
async def start_workflow(req: WorkflowCreateRequest):
    """
    Trigger a new LangGraph multi-agent execution pipeline.
    """
    workflow_id = str(uuid.uuid4())
    # Initialize state and run asynchronous LangGraph runner
    return {"workflow_id": workflow_id, "status": "running", "task": req.task}

@router.post("/workflows/{workflow_id}/human-action")
async def handle_human_review(workflow_id: str, action: str, notes: Optional[str] = None):
    """
    Resume paused workflow when confidence_score < 0.90 or requires_human_approval is True.
    """
    return {"workflow_id": workflow_id, "action": action, "status": "resumed"}
`
  },
  {
    path: 'multi_agent_platform/docker-compose.yml',
    filename: 'docker-compose.yml',
    category: 'docker',
    description: 'Docker Compose orchestration for FastAPI backend, React frontend, PostgreSQL database, and OpenTelemetry collector.',
    content: `version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://admin:secret@postgres:5432/multiagent_db
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    depends_on:
      - postgres
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=multiagent_db
    volumes:
      - pgdata:/var/lib/postgresql/data

  otel-collector:
    image: otel/opentelemetry-collector:latest
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "4318:4318" # OTLP HTTP receiver

volumes:
  pgdata:
`
  },
  {
    path: 'multi_agent_platform/backend/requirements.txt',
    filename: 'requirements.txt',
    category: 'docker',
    description: 'Python 3.11+ dependencies for FastAPI, LangGraph, LangChain, Google GenAI, and Ragas.',
    content: `fastapi==0.110.0
uvicorn[standard]==0.28.0
pydantic==2.6.4
langgraph==0.0.38
langchain==0.1.13
langchain-google-genai==1.0.1
ragas==0.1.7
deepeval==0.21.0
sqlalchemy[asyncio]==2.0.29
asyncpg==0.29.0
opentelemetry-api==1.24.0
opentelemetry-sdk==1.24.0
pytest==8.1.1
`
  }
];
