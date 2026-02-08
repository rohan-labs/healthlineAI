import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WORKFLOW_TEMPLATES, WorkflowTemplate } from '@/constants/workflowTemplates';
import { Calendar, Pill, Stethoscope, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Pill,
  Stethoscope,
};

interface TemplateSelectorProps {
  onSelect: (template: WorkflowTemplate) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {WORKFLOW_TEMPLATES.map((template) => {
        const Icon = iconMap[template.icon];
        return (
          <Card key={template.id} className="hover:border-primary cursor-pointer transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <span className="text-xs text-muted-foreground capitalize">
                    {template.category}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {template.description}
              </CardDescription>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onSelect(template)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
