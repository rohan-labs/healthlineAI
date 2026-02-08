import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FieldHelpTooltipProps {
  title: string;
  description: string;
  example?: string;
}

export function FieldHelpTooltip({ title, description, example }: FieldHelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex">
          <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm space-y-2 bg-popover text-popover-foreground border shadow-md" side="right">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs leading-relaxed">{description}</p>
        {example && (
          <>
            <p className="font-semibold text-xs pt-1">Example:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{example}</p>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
