/**
 * SLA Remediation API service
 * Provides API calls for automated violation response and remediation workflows
 */

export interface RemediationAction {
  action_type: string;
  description: string;
  parameters: Record<string, any>;
  timeout_minutes: number;
  rollback_enabled: boolean;
}

export interface RemediationStrategy {
  strategy_id: string;
  strategy_name: string;
  violation_type: string;
  automation_level: 'fully_automated' | 'semi_automated' | 'manual_approval';
  actions: RemediationAction[];
  success_rate: number;
  avg_resolution_time: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  timestamp: string;
  event: string;
  details: Record<string, any>;
  user_id?: string;
}

export interface RemediationExecution {
  execution_id: string;
  violation_id: string;
  strategy_id: string;
  status: 'pending' | 'analyzing' | 'executing' | 'success' | 'failed' | 'escalated' | 'manual_override';
  start_time: string;
  end_time?: string;
  success: boolean;
  failure_reason?: string;
  actions_completed: string[];
  rollback_performed: boolean;
  escalation_level: number;
  manual_override: boolean;
  audit_log: AuditLogEntry[];
}

export interface NotificationSent {
  target_id: string;
  target_type: string;
  address: string;
  success: boolean;
  timestamp: string;
}

export interface EscalationExecution {
  escalation_id: string;
  violation_id: string;
  escalation_level: number;
  trigger: string;
  status: string;
  start_time: string;
  end_time?: string;
  notifications_sent: NotificationSent[];
  actions_completed: string[];
  escalation_reason: string;
  business_impact_score: number;
}

export interface RemediationSummary {
  timestamp: string;
  active_remediations: number;
  active_escalations: number;
  total_violations_today: number;
  success_rate_today: number;
  avg_resolution_time_today: number;
  critical_violations: number;
  remediations_by_status: Record<string, number>;
  escalations_by_level: Record<number, number>;
}

export interface ManualOverrideRequest {
  action: 'stop' | 'escalate' | 'retry' | 'rollback';
  reason: string;
  user_id: string;
  force?: boolean;
}

export interface RootCauseAnalysis {
  violation_id: string;
  primary_cause: {
    category: string;
    confidence: number;
    evidence: any[];
  };
  contributing_factors: any[];
  similar_incidents: any[];
  recommended_remediation: any[];
  prevention_suggestions: any[];
}

export interface RemediationHistoryResponse {
  total_violations: number;
  total_remediations: number;
  success_rate: number;
  avg_resolution_time: number;
  escalation_rate: number;
  cost_savings_estimate?: number;
  history_items: any[];
  period_start: string;
  period_end: string;
}

class SLARemediationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1/sla-remediation${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Strategy Management
  async listStrategies(filters: {
    violation_type?: string;
    automation_level?: string;
    min_success_rate?: number;
  } = {}): Promise<RemediationStrategy[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<RemediationStrategy[]>(`/strategies${query}`);
  }

  async createStrategy(strategy: {
    strategy_name: string;
    violation_type: string;
    automation_level: string;
    actions: RemediationAction[];
    risk_level?: string;
  }): Promise<RemediationStrategy> {
    return this.request<RemediationStrategy>('/strategies', {
      method: 'POST',
      body: JSON.stringify(strategy),
    });
  }

  // Execution Management
  async listExecutions(filters: {
    status?: string;
    violation_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<RemediationExecution[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<RemediationExecution[]>(`/executions${query}`);
  }

  async getExecution(executionId: string): Promise<RemediationExecution> {
    return this.request<RemediationExecution>(`/executions/${executionId}`);
  }

  async triggerRemediation(
    violationId: string, 
    options: {
      strategy_id?: string;
      force_level?: number;
    } = {}
  ): Promise<{ message: string; violation_id: string; status: string }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/violations/${violationId}/remediate${query}`, {
      method: 'POST',
    });
  }

  async manualOverride(
    executionId: string, 
    overrideRequest: ManualOverrideRequest
  ): Promise<any> {
    return this.request(`/executions/${executionId}/manual-override`, {
      method: 'POST',
      body: JSON.stringify(overrideRequest),
    });
  }

  async rollbackRemediation(
    executionId: string, 
    reason: string
  ): Promise<any> {
    return this.request(`/executions/${executionId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Root Cause Analysis
  async getRootCauseAnalysis(violationId: string): Promise<{
    analysis: RootCauseAnalysis;
    generated_at: string;
    model_version: string;
    processing_time_ms: number;
  }> {
    return this.request(`/violations/${violationId}/root-cause-analysis`);
  }

  // Historical Data
  async getRemediationHistory(
    days: number = 30,
    filters: {
      violation_type?: string;
      strategy_id?: string;
    } = {}
  ): Promise<RemediationHistoryResponse> {
    const params = new URLSearchParams({ days: days.toString() });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value);
      }
    });
    
    return this.request<RemediationHistoryResponse>(`/history?${params.toString()}`);
  }

  // Active Status
  async getActiveSummary(): Promise<RemediationSummary> {
    return this.request<RemediationSummary>('/active-summary');
  }

  // Testing
  async testStrategy(
    strategyId: string, 
    testData: Record<string, any>
  ): Promise<any> {
    return this.request(`/strategies/${strategyId}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  async getStrategyEffectiveness(
    strategyId: string, 
    days: number = 30
  ): Promise<any> {
    return this.request(`/strategies/${strategyId}/effectiveness?days=${days}`);
  }

  // Escalation Management
  async listEscalations(filters: {
    level?: number;
    status?: string;
  } = {}): Promise<EscalationExecution[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<EscalationExecution[]>(`/escalations${query}`);
  }

  async controlEscalation(
    escalationId: string, 
    action: string, 
    reason?: string
  ): Promise<any> {
    return this.request(`/escalations/${escalationId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  // System Health
  async getSystemHealth(): Promise<any> {
    return this.request('/system-health');
  }

  // Convenience methods for common operations
  async stopRemediation(executionId: string, reason: string = 'Manual stop requested'): Promise<any> {
    return this.manualOverride(executionId, {
      action: 'stop',
      reason,
      user_id: 'current_user', // In production, get from auth context
    });
  }

  async escalateRemediation(executionId: string, reason: string = 'Manual escalation requested'): Promise<any> {
    return this.manualOverride(executionId, {
      action: 'escalate', 
      reason,
      user_id: 'current_user',
    });
  }

  async retryRemediation(executionId: string, reason: string = 'Manual retry requested'): Promise<any> {
    return this.manualOverride(executionId, {
      action: 'retry',
      reason,
      user_id: 'current_user',
    });
  }

  async overrideEscalation(escalationId: string, reason?: string): Promise<any> {
    return this.controlEscalation(escalationId, 'stop', reason);
  }
}

export const slaRemediationService = new SLARemediationService();
export default slaRemediationService;