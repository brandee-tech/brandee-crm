import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings2, Plus } from "lucide-react";
import { Pipeline } from "@/hooks/usePipelines";

interface PipelineSelectorProps {
    pipelines: Pipeline[];
    selectedPipelineId: string;
    onPipelineChange: (value: string) => void;
    onManagePipelines: () => void;
    loading?: boolean;
}

export function PipelineSelector({
    pipelines,
    selectedPipelineId,
    onPipelineChange,
    onManagePipelines,
    loading
}: PipelineSelectorProps) {

    // Se não houver pipelines carregados ou loading, renderize um estado seguro
    if (loading && pipelines.length === 0) {
        return (
            <div className="w-[200px] h-9 bg-muted/20 animate-pulse rounded-md" />
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedPipelineId} onValueChange={onPipelineChange} disabled={loading}>
                <SelectTrigger className="w-[240px] border-dashed border-2 bg-transparent hover:bg-accent/50 transition-colors font-medium">
                    <SelectValue placeholder="Selecione um pipeline" />
                </SelectTrigger>
                <SelectContent>
                    {pipelines.map(pipeline => (
                        <SelectItem key={pipeline.id} value={pipeline.id} className="cursor-pointer">
                            {pipeline.name}
                        </SelectItem>
                    ))}
                    {pipelines.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            Nenhum pipeline encontrado
                        </div>
                    )}
                    <SelectSeparator />
                    <div className="p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                onManagePipelines();
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Gerenciar Pipelines
                        </Button>
                    </div>
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="icon"
                onClick={onManagePipelines}
                title="Gerenciar Pipelines"
                className="text-muted-foreground hover:text-foreground"
            >
                <Settings2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
