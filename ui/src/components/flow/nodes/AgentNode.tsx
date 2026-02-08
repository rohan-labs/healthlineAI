import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import { Edit, FileText, Headset, PlusIcon, Trash2Icon, Wrench } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useWorkflow } from "@/app/workflow/[workflowId]/contexts/WorkflowContext";
import type { DocumentResponseSchema, ToolResponse } from "@/client/types.gen";
import { DocumentBadges } from "@/components/flow/DocumentBadges";
import { DocumentSelector } from "@/components/flow/DocumentSelector";
import { ToolBadges } from "@/components/flow/ToolBadges";
import { ToolSelector } from "@/components/flow/ToolSelector";
import { ExtractionVariable, FlowNodeData } from "@/components/flow/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldHelpTooltip } from "@/components/workflow/FieldHelpTooltip";

import { NodeContent } from "./common/NodeContent";
import { NodeEditDialog } from "./common/NodeEditDialog";
import { useNodeHandlers } from "./common/useNodeHandlers";

interface AgentNodeEditFormProps {
    nodeData: FlowNodeData;
    prompt: string;
    setPrompt: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    allowInterrupt: boolean;
    setAllowInterrupt: (value: boolean) => void;
    extractionEnabled: boolean;
    setExtractionEnabled: (value: boolean) => void;
    extractionPrompt: string;
    setExtractionPrompt: (value: string) => void;
    variables: ExtractionVariable[];
    setVariables: (vars: ExtractionVariable[]) => void;
    addGlobalPrompt: boolean;
    setAddGlobalPrompt: (value: boolean) => void;
    toolUuids: string[];
    setToolUuids: (value: string[]) => void;
    documentUuids: string[];
    setDocumentUuids: (value: string[]) => void;
    tools: ToolResponse[];
    documents: DocumentResponseSchema[];
}

interface AgentNodeProps extends NodeProps {
    data: FlowNodeData;
}

export const AgentNode = memo(({ data, selected, id }: AgentNodeProps) => {
    const { open, setOpen, handleSaveNodeData, handleDeleteNode } = useNodeHandlers({ id });
    const { saveWorkflow, tools, documents } = useWorkflow();

    // Form state
    const [prompt, setPrompt] = useState(data.prompt);
    const [name, setName] = useState(data.name);
    const [allowInterrupt, setAllowInterrupt] = useState(data.allow_interrupt ?? true);

    // Variable Extraction state
    const [extractionEnabled, setExtractionEnabled] = useState(data.extraction_enabled ?? false);
    const [extractionPrompt, setExtractionPrompt] = useState(data.extraction_prompt ?? "");
    const [variables, setVariables] = useState<ExtractionVariable[]>(data.extraction_variables ?? []);
    const [addGlobalPrompt, setAddGlobalPrompt] = useState(data.add_global_prompt ?? true);
    const [toolUuids, setToolUuids] = useState<string[]>(data.tool_uuids ?? []);
    const [documentUuids, setDocumentUuids] = useState<string[]>(data.document_uuids ?? []);

    // Compute if form has unsaved changes (only check prompt, name)
    const isDirty = useMemo(() => {
        return (
            prompt !== (data.prompt ?? "") ||
            name !== (data.name ?? "")
        );
    }, [prompt, name, data]);

    const handleSave = async () => {
        handleSaveNodeData({
            ...data,
            prompt,
            name,
            allow_interrupt: allowInterrupt,
            extraction_enabled: extractionEnabled,
            extraction_prompt: extractionPrompt,
            extraction_variables: variables,
            add_global_prompt: addGlobalPrompt,
            tool_uuids: toolUuids.length > 0 ? toolUuids : undefined,
            document_uuids: documentUuids.length > 0 ? documentUuids : undefined,
        });
        setOpen(false);
        // Save the workflow after updating node data with a small delay to ensure state is updated
        setTimeout(async () => {
            await saveWorkflow();
        }, 100);
    };

    // Reset form state when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setPrompt(data.prompt);
            setName(data.name);
            setAllowInterrupt(data.allow_interrupt ?? true);
            setExtractionEnabled(data.extraction_enabled ?? false);
            setExtractionPrompt(data.extraction_prompt ?? "");
            setVariables(data.extraction_variables ?? []);
            setAddGlobalPrompt(data.add_global_prompt ?? true);
            setToolUuids(data.tool_uuids ?? []);
            setDocumentUuids(data.document_uuids ?? []);
        }
        setOpen(newOpen);
    };

    // Update form state when data changes (e.g., from undo/redo)
    useEffect(() => {
        if (open) {
            setPrompt(data.prompt);
            setName(data.name);
            setAllowInterrupt(data.allow_interrupt ?? true);
            setExtractionEnabled(data.extraction_enabled ?? false);
            setExtractionPrompt(data.extraction_prompt ?? "");
            setVariables(data.extraction_variables ?? []);
            setAddGlobalPrompt(data.add_global_prompt ?? true);
            setToolUuids(data.tool_uuids ?? []);
            setDocumentUuids(data.document_uuids ?? []);
        }
    }, [data, open]);

    // Handle cleanup of stale document UUIDs
    const handleStaleDocuments = useCallback((staleUuids: string[]) => {
        const cleanedUuids = (data.document_uuids ?? []).filter(uuid => !staleUuids.includes(uuid));
        handleSaveNodeData({
            ...data,
            document_uuids: cleanedUuids.length > 0 ? cleanedUuids : undefined,
        });
        setTimeout(async () => {
            await saveWorkflow();
        }, 100);
    }, [data, handleSaveNodeData, saveWorkflow]);

    // Handle cleanup of stale tool UUIDs
    const handleStaleTools = useCallback((staleUuids: string[]) => {
        const cleanedUuids = (data.tool_uuids ?? []).filter(uuid => !staleUuids.includes(uuid));
        handleSaveNodeData({
            ...data,
            tool_uuids: cleanedUuids.length > 0 ? cleanedUuids : undefined,
        });
        setTimeout(async () => {
            await saveWorkflow();
        }, 100);
    }, [data, handleSaveNodeData, saveWorkflow]);

    return (
        <>
            <NodeContent
                selected={selected}
                invalid={data.invalid}
                selected_through_edge={data.selected_through_edge}
                hovered_through_edge={data.hovered_through_edge}
                title={data.name || 'Conversation Step'}
                icon={<Headset />}
                nodeType="agent"
                hasSourceHandle={true}
                hasTargetHandle={true}
                onDoubleClick={() => setOpen(true)}
                nodeId={id}
            >
                <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed">
                    {data.prompt || 'No prompt configured'}
                </p>
                {data.tool_uuids && data.tool_uuids.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <Wrench className="h-3 w-3" />
                            <span>Tools:</span>
                        </div>
                        <ToolBadges toolUuids={data.tool_uuids} onStaleUuidsDetected={handleStaleTools} />
                    </div>
                )}
                {data.document_uuids && data.document_uuids.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <FileText className="h-3 w-3" />
                            <span>Documents:</span>
                        </div>
                        <DocumentBadges documentUuids={data.document_uuids} onStaleUuidsDetected={handleStaleDocuments} />
                    </div>
                )}
            </NodeContent>

            <NodeToolbar isVisible={selected} position={Position.Right}>
                <div className="flex flex-col gap-1">
                    <Button onClick={() => setOpen(true)} variant="outline" size="icon">
                        <Edit />
                    </Button>
                    <Button onClick={handleDeleteNode} variant="outline" size="icon">
                        <Trash2Icon />
                    </Button>
                </div>
            </NodeToolbar>

            <NodeEditDialog
                open={open}
                onOpenChange={handleOpenChange}
                nodeData={data}
                title="Edit Conversation Step"
                onSave={handleSave}
                isDirty={isDirty}
            >
                {open && (
                    <AgentNodeEditForm
                        nodeData={data}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        name={name}
                        setName={setName}
                        allowInterrupt={allowInterrupt}
                        setAllowInterrupt={setAllowInterrupt}
                        extractionEnabled={extractionEnabled}
                        setExtractionEnabled={setExtractionEnabled}
                        extractionPrompt={extractionPrompt}
                        setExtractionPrompt={setExtractionPrompt}
                        variables={variables}
                        setVariables={setVariables}
                        addGlobalPrompt={addGlobalPrompt}
                        setAddGlobalPrompt={setAddGlobalPrompt}
                        toolUuids={toolUuids}
                        setToolUuids={setToolUuids}
                        documentUuids={documentUuids}
                        setDocumentUuids={setDocumentUuids}
                        tools={tools ?? []}
                        documents={documents ?? []}
                    />
                )}
            </NodeEditDialog>
        </>
    );
});

const AgentNodeEditForm = ({
    prompt,
    setPrompt,
    name,
    setName,
    allowInterrupt,
    setAllowInterrupt,
    extractionEnabled,
    setExtractionEnabled,
    extractionPrompt,
    setExtractionPrompt,
    variables,
    setVariables,
    addGlobalPrompt,
    setAddGlobalPrompt,
    toolUuids,
    setToolUuids,
    documentUuids,
    setDocumentUuids,
    tools,
    documents,
}: AgentNodeEditFormProps) => {
    const handleVariableNameChange = (idx: number, value: string) => {
        const newVars = [...variables];
        newVars[idx] = { ...newVars[idx], name: value };
        setVariables(newVars);
    };

    const handleVariableTypeChange = (idx: number, value: 'string' | 'number' | 'boolean') => {
        const newVars = [...variables];
        newVars[idx] = { ...newVars[idx], type: value };
        setVariables(newVars);
    };

    const handleVariablePromptChange = (idx: number, value: string) => {
        const newVars = [...variables];
        newVars[idx] = { ...newVars[idx], prompt: value };
        setVariables(newVars);
    };

    const handleRemoveVariable = (idx: number) => {
        const newVars = variables.filter((_, i) => i !== idx);
        setVariables(newVars);
    };

    const handleAddVariable = () => {
        setVariables([...variables, { name: '', type: 'string', prompt: '' }]);
    };

    return (
        <div className="grid gap-2">
            <Label>Name</Label>
            <Label className="text-xs text-muted-foreground">
                A short name to identify this step in call logs. Example: &quot;Appointment Confirmation&quot; or &quot;Collect Symptoms&quot;.
            </Label>
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Appointment Confirmation"
            />

            <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/20">
                <Switch id="allow-interrupt" checked={allowInterrupt} onCheckedChange={setAllowInterrupt} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="allow-interrupt">Let Patient Interrupt</Label>
                    <FieldHelpTooltip
                        title="What happens when enabled?"
                        description="The patient can ask questions or change topics while the AI is speaking. This makes conversations feel more natural."
                        example="If the AI is giving appointment details, the patient can interrupt to ask 'Can I reschedule?' without waiting."
                    />
                </div>
                <Label className="text-xs text-muted-foreground ml-2">
                    Recommended for natural conversations.
                </Label>
            </div>

            <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/20">
                <Switch id="add-global-prompt" checked={addGlobalPrompt} onCheckedChange={setAddGlobalPrompt} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="add-global-prompt">Include Practice-Wide Instructions</Label>
                    <FieldHelpTooltip
                        title="What is this?"
                        description="Automatically includes instructions from your Practice-Wide Instructions node (like practice name, hours, or standard policies) in this conversation step."
                        example="If you have a Practice-Wide node with 'You are calling from ABC Medical Center', that information will be included here automatically."
                    />
                </div>
                <Label className="text-xs text-muted-foreground ml-2">
                    Includes practice name, hours, and policies.
                </Label>
            </div>


            <div className="pt-2 space-y-2">
                <Label>What to Say</Label>
                <Label className="text-xs text-muted-foreground">
                    {"Write what the AI should say at this step. You can use patient information like {{patient_name}} or {{appointment_date}}."}
                </Label>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] max-h-[300px] resize-none"
                    style={{
                        overflowY: 'auto'
                    }}
                    placeholder="e.g., Can you tell me when your symptoms started and if you've had this issue before?"
                />
            </div>


            {/* Variable Extraction Section */}
            <div className="flex items-center space-x-2 pt-2">
                <Switch id="enable-extraction" checked={extractionEnabled} onCheckedChange={setExtractionEnabled} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="enable-extraction">Collect Information from Patient</Label>
                    <FieldHelpTooltip
                        title="What is this?"
                        description="Use this to collect specific information during the call that you can save or use later. The information gets extracted automatically from the conversation."
                        example="For appointment reminders: collect 'Can you confirm?' (Yes/No) and 'Preferred reschedule date' if they can't make it."
                    />
                </div>
                <Label className="text-xs text-muted-foreground ml-2">
                    Save appointment confirmations, medication names, etc.
                </Label>
            </div>

            {extractionEnabled && (
                <div className="border rounded-md p-3 mt-2 space-y-2 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Label>What to Ask For</Label>
                        <FieldHelpTooltip
                            title="Extraction Prompt"
                            description="Write a summary of all the information you want to collect in this step. This helps the AI know what to look for in the patient's responses."
                            example="Extract whether the patient confirms the appointment (Yes/No) and if rescheduling, what date they prefer."
                        />
                    </div>
                    <Label className="text-xs text-muted-foreground">
                        Describe what information you want to collect from this conversation.
                    </Label>
                    <Textarea
                        value={extractionPrompt}
                        onChange={(e) => setExtractionPrompt(e.target.value)}
                        className="min-h-[80px] max-h-[200px] resize-none"
                        style={{ overflowY: 'auto' }}
                        placeholder="Example: Extract whether the patient confirms the appointment (Yes/No) and if rescheduling, what date they prefer."
                    />

                    <Label>Information to Collect</Label>
                    <Label className="text-xs text-muted-foreground">
                        Define each piece of information you want to save.
                    </Label>

                    {variables.map((v, idx) => (
                        <div key={idx} className="space-y-2 border rounded-md p-2 bg-background">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g., appointment_confirmed, medication_name"
                                    value={v.name}
                                    onChange={(e) => handleVariableNameChange(idx, e.target.value)}
                                />
                                <select
                                    className="border rounded-md p-2 text-sm bg-background"
                                    value={v.type}
                                    onChange={(e) => handleVariableTypeChange(idx, e.target.value as 'string' | 'number' | 'boolean')}
                                >
                                    <option value="string">Text</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Yes/No</option>
                                </select>
                                <Button variant="outline" size="icon" onClick={() => handleRemoveVariable(idx)}>
                                    <Trash2Icon className="w-4 h-4" />
                                </Button>
                            </div>
                            <Textarea
                                placeholder="e.g., Did the patient confirm they can make the appointment? (Yes/No/Reschedule)"
                                value={v.prompt ?? ''}
                                onChange={(e) => handleVariablePromptChange(idx, e.target.value)}
                                className="min-h-[60px] resize-none"
                            />
                        </div>
                    ))}

                    <Button variant="outline" size="sm" className="w-fit" onClick={handleAddVariable}>
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Information Field
                    </Button>
                </div>
            )}

            {/* Tools Section */}
            <div className="pt-4 border-t mt-4">
                <ToolSelector
                    value={toolUuids}
                    onChange={setToolUuids}
                    tools={tools}
                    description="Select tools that the agent can invoke during this conversation step."
                />
            </div>

            {/* Documents Section */}
            <div className="pt-4 border-t mt-4">
                <DocumentSelector
                    value={documentUuids}
                    onChange={setDocumentUuids}
                    documents={documents}
                    description="Select documents from the knowledge base that the agent can reference during this conversation step."
                />
            </div>
        </div>
    );
};

AgentNode.displayName = "AgentNode";

