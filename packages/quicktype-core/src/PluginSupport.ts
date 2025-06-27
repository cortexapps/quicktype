// Plugin support stub for quicktype-core
// This allows the core package to support plugins without circular dependencies

export interface PluginContext {
    options: Record<string, any>;
    language: string;
    framework?: string;
    emitLine: (code: any) => void;
    emitAnnotation: (annotation: string) => void;
}

export interface PluginRunner {
    runHook(hookName: string, context?: any): void;
}

// Global plugin runner instance - will be set by the main quicktype package
export let globalPluginRunner: PluginRunner | undefined;

export function setGlobalPluginRunner(runner: PluginRunner): void {
    globalPluginRunner = runner;
}

export function getPluginRunner(renderer: any, options: any): PluginRunner | undefined {
    if (!globalPluginRunner) return undefined;
    
    // Create a context-specific runner
    return {
        runHook(hookName: string, context?: any) {
            const fullContext = {
                renderer,
                options,
                language: renderer.targetLanguage.name,
                framework: options.framework,
                emitLine: (code: any) => renderer.emitLine(code),
                emitAnnotation: (annotation: string) => renderer.emitLine(annotation),
                ...context
            };
            globalPluginRunner!.runHook(hookName, fullContext);
        }
    };
}