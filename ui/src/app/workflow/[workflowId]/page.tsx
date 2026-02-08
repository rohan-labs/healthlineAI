'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import RenderWorkflow from '@/app/workflow/[workflowId]/RenderWorkflow';
import { getWorkflowApiV1WorkflowFetchWorkflowIdGet } from '@/client/sdk.gen';
import type { WorkflowResponse } from '@/client/types.gen';
import { FlowEdge, FlowNode } from '@/components/flow/types';
import SpinLoader from '@/components/SpinLoader';
import { WORKFLOW_TEMPLATES } from '@/constants/workflowTemplates';
import { useAuth } from '@/lib/auth';
import logger from '@/lib/logger';
import { DEFAULT_WORKFLOW_CONFIGURATIONS, WorkflowConfigurations } from '@/types/workflow-configurations';

import WorkflowLayout from '../WorkflowLayout';

export default function WorkflowDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [workflow, setWorkflow] = useState<WorkflowResponse | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, getAccessToken, redirectToLogin, loading: authLoading } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            redirectToLogin();
        }
    }, [authLoading, user, redirectToLogin]);

    useEffect(() => {
        const fetchWorkflow = async () => {
            if (!user) return;

            // Handle "new" workflow - create blank template without backend call
            if (params.workflowId === 'new') {
                const workflowName = searchParams.get('name') || 'New Workflow';
                const callType = searchParams.get('callType') || 'inbound';
                const templateId = searchParams.get('templateId');

                // Check if loading from a template
                if (templateId) {
                    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
                    if (template) {
                        const templateWorkflow: WorkflowResponse = {
                            id: 0, // Temporary ID
                            name: workflowName,
                            status: 'draft',
                            created_at: new Date().toISOString(),
                            workflow_definition: {
                                nodes: template.nodes as FlowNode[],
                                edges: template.edges as FlowEdge[],
                            },
                            current_definition_id: null,
                            template_context_variables: template.templateContextVariables,
                            call_disposition_codes: {},
                            total_runs: 0,
                            workflow_configurations: {
                                ...DEFAULT_WORKFLOW_CONFIGURATIONS,
                                call_type: template.configurations?.call_type || (callType as 'inbound' | 'outbound'),
                            },
                        };
                        setWorkflow(templateWorkflow);
                        setLoading(false);
                        return;
                    }
                }

                // Create a minimal blank workflow structure
                const blankWorkflow: WorkflowResponse = {
                    id: 0, // Temporary ID, will be assigned by backend on save
                    name: workflowName,
                    status: 'draft',
                    created_at: new Date().toISOString(),
                    workflow_definition: {
                        nodes: [],
                        edges: [],
                    },
                    current_definition_id: null,
                    template_context_variables: {},
                    call_disposition_codes: {},
                    total_runs: 0,
                    workflow_configurations: {
                        ...DEFAULT_WORKFLOW_CONFIGURATIONS,
                        call_type: callType as 'inbound' | 'outbound',
                    },
                };

                setWorkflow(blankWorkflow);
                setLoading(false);
                return;
            }

            // Existing workflow - fetch from backend
            try {
                const accessToken = await getAccessToken();
                const response = await getWorkflowApiV1WorkflowFetchWorkflowIdGet({
                    path: {
                        workflow_id: Number(params.workflowId)
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                const workflow = response.data;
                setWorkflow(workflow);
            } catch (err) {
                setError('Failed to fetch workflow');
                logger.error(`Error fetching workflow: ${err}`);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWorkflow();
        }
    }, [params.workflowId, searchParams, user, getAccessToken]);

    // Memoize user and getAccessToken to prevent unnecessary re-renders
    const stableUser = useMemo(() => user, [user]);
    const stableGetAccessToken = useMemo(() => getAccessToken, [getAccessToken]);

    if (loading) {
        return (
            <WorkflowLayout>
                <SpinLoader />
            </WorkflowLayout>
        );
    }
    else if (error || !workflow) {
        return (
            <WorkflowLayout showFeaturesNav={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg text-destructive">{error || 'Workflow not found'}</div>
                </div>
            </WorkflowLayout>
        );
    }
    else {
        return stableUser ? (
            <RenderWorkflow
                initialWorkflowName={workflow.name}
                workflowId={workflow.id}
                initialFlow={{
                    nodes: workflow.workflow_definition.nodes as FlowNode[],
                    edges: workflow.workflow_definition.edges as FlowEdge[],
                    viewport: { x: 0, y: 0, zoom: 0 }
                }}
                initialTemplateContextVariables={workflow.template_context_variables as Record<string, string> || {}}
                initialWorkflowConfigurations={(workflow.workflow_configurations as WorkflowConfigurations) || DEFAULT_WORKFLOW_CONFIGURATIONS}
                user={stableUser}
                getAccessToken={stableGetAccessToken}
            />
        ) : null;
    }
}
