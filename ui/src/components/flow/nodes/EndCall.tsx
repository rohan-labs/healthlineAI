import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import { Edit, OctagonX, PlusIcon, Trash2Icon } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

import { useWorkflow } from "@/app/workflow/[workflowId]/contexts/WorkflowContext";
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

interface EndCallEditFormProps {
    nodeData: FlowNodeData;
    prompt: string;
    setPrompt: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    extractionEnabled: boolean;
    setExtractionEnabled: (value: boolean) => void;
    extractionPrompt: string;
    setExtractionPrompt: (value: string) => void;
    variables: ExtractionVariable[];
    setVariables: (vars: ExtractionVariable[]) => void;
    addGlobalPrompt: boolean;
    setAddGlobalPrompt: (value: boolean) => void;
}

interface EndCallNodeProps extends NodeProps {
    data: FlowNodeData;
}

export const EndCall = memo(({ data, selected, id }: EndCallNodeProps) => {
    const { open, setOpen, handleSaveNodeData, handleDeleteNode } = useNodeHandlers({
        id,
        additionalData: { is_end: true }
    });
    const { saveWorkflow } = useWorkflow();

    // Form state
    const [prompt, setPrompt] = useState(data.prompt);
    const [name, setName] = useState(data.name);

    // Variable Extraction state
    const [extractionEnabled, setExtractionEnabled] = useState(data.extraction_enabled ?? false);
    const [extractionPrompt, setExtractionPrompt] = useState(data.extraction_prompt ?? "");
    const [variables, setVariables] = useState<ExtractionVariable[]>(data.extraction_variables ?? []);
    const [addGlobalPrompt, setAddGlobalPrompt] = useState(data.add_global_prompt ?? true);

    // Compute if form has unsaved changes (simplified: only check prompt, name)
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
            allow_interrupt: false,  // Always set to false for end nodes
            extraction_enabled: extractionEnabled,
            extraction_prompt: extractionPrompt,
            extraction_variables: variables,
            add_global_prompt: addGlobalPrompt,
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
            setExtractionEnabled(data.extraction_enabled ?? false);
            setExtractionPrompt(data.extraction_prompt ?? "");
            setVariables(data.extraction_variables ?? []);
            setAddGlobalPrompt(data.add_global_prompt ?? true);
        }
        setOpen(newOpen);
    };

    // Update form state when data changes (e.g., from undo/redo)
    useEffect(() => {
        if (open) {
            setPrompt(data.prompt);
            setName(data.name);
            setExtractionEnabled(data.extraction_enabled ?? false);
            setExtractionPrompt(data.extraction_prompt ?? "");
            setVariables(data.extraction_variables ?? []);
            setAddGlobalPrompt(data.add_global_prompt ?? true);
        }
    }, [data, open]);

    return (
        <>
            <NodeContent
                selected={selected}
                invalid={data.invalid}
                selected_through_edge={data.selected_through_edge}
                hovered_through_edge={data.hovered_through_edge}
                title="End Call"
                icon={<OctagonX />}
                nodeType="end"
                hasTargetHandle={true}
                onDoubleClick={() => setOpen(true)}
                nodeId={id}
            >
                <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed">
                    {data.prompt || 'No prompt configured'}
                </p>
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
                title="End Call"
                onSave={handleSave}
                isDirty={isDirty}
            >
                {open && (
                    <EndCallEditForm
                        nodeData={data}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        name={name}
                        setName={setName}
                        extractionEnabled={extractionEnabled}
                        setExtractionEnabled={setExtractionEnabled}
                        extractionPrompt={extractionPrompt}
                        setExtractionPrompt={setExtractionPrompt}
                        variables={variables}
                        setVariables={setVariables}
                        addGlobalPrompt={addGlobalPrompt}
                        setAddGlobalPrompt={setAddGlobalPrompt}
                    />
                )}
            </NodeEditDialog>
        </>
    );
});

const EndCallEditForm = ({
    prompt,
    setPrompt,
    name,
    setName,
    extractionEnabled,
    setExtractionEnabled,
    extractionPrompt,
    setExtractionPrompt,
    variables,
    setVariables,
    addGlobalPrompt,
    setAddGlobalPrompt,
}: EndCallEditFormProps) => {
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
                A short name to identify this step in call logs. Example: &quot;Closing&quot; or &quot;Thank You&quot;.
            </Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Thank You & Goodbye" />

            <Label>What to Say</Label>
            <Label className="text-xs text-muted-foreground">
                Write how the AI should close the call. Thank the patient and provide next steps or contact information.
            </Label>
            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] max-h-[300px] resize-none"
                style={{
                    overflowY: 'auto'
                }}
                placeholder="e.g., Thank you! We'll see you on {{appointment_date}}. If you need to reach us, call {{office_phone}}. Goodbye!"
            />
            <div className="flex items-center space-x-2">
                <Switch id="add-global-prompt" checked={addGlobalPrompt} onCheckedChange={setAddGlobalPrompt} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="add-global-prompt">Include Practice-Wide Instructions</Label>
                    <FieldHelpTooltip
                        title="What is this?"
                        description="Automatically includes instructions from your Practice-Wide Instructions node in the closing message."
                        example="If your Practice-Wide node includes standard closing policies, those will be included here."
                    />
                </div>
                <Label className="text-xs text-muted-foreground">
                    Includes practice policies in closing.
                </Label>
            </div>

            {/* Variable Extraction Section */}
            <div className="flex items-center space-x-2 pt-2">
                <Switch id="enable-extraction" checked={extractionEnabled} onCheckedChange={setExtractionEnabled} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="enable-extraction">Collect Information from Patient</Label>
                    <FieldHelpTooltip
                        title="What is this?"
                        description="Use this to collect any final information before ending the call. This is useful for capturing last-minute questions or concerns."
                        example="Collect whether the patient mentioned any follow-up needs or additional questions they want answered."
                    />
                </div>
                <Label className="text-xs text-muted-foreground ml-2">
                    Save final questions or concerns.
                </Label>
            </div>

            {extractionEnabled && (
                <div className="border rounded-md p-3 mt-2 space-y-2 bg-muted/20">
                    <Label>What to Ask For</Label>
                    <Label className="text-xs text-muted-foreground">
                        Describe what final information you want to collect before ending the call.
                    </Label>
                    <Textarea
                        value={extractionPrompt}
                        onChange={(e) => setExtractionPrompt(e.target.value)}
                        className="min-h-[80px] max-h-[200px] resize-none"
                        style={{ overflowY: 'auto' }}
                        placeholder="Example: Extract any follow-up questions or concerns the patient mentioned."
                    />

                    <Label>Information to Collect</Label>
                    <Label className="text-xs text-muted-foreground">
                        Define each piece of information you want to save.
                    </Label>

                    {variables.map((v, idx) => (
                        <div key={idx} className="space-y-2 border rounded-md p-2 bg-background">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g., follow_up_needed, patient_satisfied"
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
                                placeholder="e.g., Did the patient mention any concerns or questions?"
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
        </div>
    );
};

EndCall.displayName = "EndCall";
