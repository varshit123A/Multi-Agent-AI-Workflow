/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MainDashboard } from './pages/MainDashboard';
import { AgentState } from './types';

export default function App() {
  const [activeWorkflow, setActiveWorkflow] = useState<AgentState | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<AgentState[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const apiBaseUrl = '/api/v1';

  // Load existing seeded workflow on initial mount
  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/workflows`);
      if (res.ok) {
        const data = await res.json();
        setAllWorkflows(data.workflows || []);
        if (data.workflows?.length > 0 && !activeWorkflow) {
          setActiveWorkflow(data.workflows[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load initial workflows:', e);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Launch LangGraph Workflow and stream SSE telemetry
  const handleStartWorkflow = async (
    task: string,
    forceHuman: boolean,
    simPii: boolean,
    simInjection: boolean
  ) => {
    if (isStreaming) return;
    setIsStreaming(true);

    try {
      const startRes = await fetch(`${apiBaseUrl}/workflows/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          force_human_review: forceHuman,
          simulate_pii: simPii,
          simulate_injection: simInjection,
        }),
      });

      if (!startRes.ok) {
        throw new Error('Failed to start workflow');
      }

      const { workflow_id } = await startRes.json();

      // Fetch initial state
      const wfRes = await fetch(`${apiBaseUrl}/workflows/${workflow_id}`);
      const initialWf: AgentState = await wfRes.json();
      setActiveWorkflow(initialWf);

      // Open Server-Sent Events stream for real-time node transitions
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(
        `${apiBaseUrl}/workflows/${workflow_id}/stream?forceHuman=${forceHuman}`
      );
      eventSourceRef.current = es;

      es.addEventListener('step_start', (event: any) => {
        const data = JSON.parse(event.data);
        setActiveWorkflow((prev) => {
          if (!prev) return prev;
          return { ...prev, activeNode: data.node, status: 'running' };
        });
      });

      es.addEventListener('step_complete', (event: any) => {
        const data = JSON.parse(event.data);
        if (data.state) {
          setActiveWorkflow(data.state);
        }
      });

      es.addEventListener('workflow_paused_for_human', (event: any) => {
        const data = JSON.parse(event.data);
        if (data.state) {
          setActiveWorkflow(data.state);
        }
        setIsStreaming(false);
        es.close();
        fetchWorkflows();
      });

      es.addEventListener('workflow_complete', (event: any) => {
        const data = JSON.parse(event.data);
        if (data.state) {
          setActiveWorkflow(data.state);
        }
        setIsStreaming(false);
        es.close();
        fetchWorkflows();
      });

      es.addEventListener('workflow_error', (event: any) => {
        setIsStreaming(false);
        es.close();
        fetchWorkflows();
      });

      es.addEventListener('done', () => {
        setIsStreaming(false);
        es.close();
        fetchWorkflows();
      });
    } catch (e) {
      console.error('Workflow start error:', e);
      setIsStreaming(false);
    }
  };

  // Submit human review action (approve, edit_and_approve, reject)
  const handleSubmitHumanReview = async (
    action: 'approve' | 'reject' | 'edit_and_approve',
    notes: string,
    editedCode?: { files: Array<{ filename: string; language: string; content: string }> }
  ) => {
    if (!activeWorkflow) return;
    try {
      const res = await fetch(`${apiBaseUrl}/workflows/${activeWorkflow.id}/human-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes, editedCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveWorkflow(data.workflow);
        fetchWorkflows();
      }
    } catch (e) {
      console.error('Human review submission error:', e);
    }
  };

  return (
    <MainDashboard
      workflow={activeWorkflow}
      onStartWorkflow={handleStartWorkflow}
      isStreaming={isStreaming}
      onSubmitReview={handleSubmitHumanReview}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
