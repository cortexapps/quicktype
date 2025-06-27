import { pluginRegistry } from "./registry";
import type { PluginContext } from "./PluginInterface";

export class GlobalPluginRunner {
    runHook(hookName: string, fullContext: any): void {
        const { renderer, options, ...hookContext } = fullContext;
        
        const language = fullContext.language || (renderer?.targetLanguage?.name);
        const framework = fullContext.framework || options?.framework;
        
        const enabledPlugins = pluginRegistry.getEnabledPlugins(language, framework);
        
        // Create context for this hook
        const context: PluginContext = {
            options,
            language,
            framework,
            emit: fullContext.emitLine,
            emitLine: fullContext.emitLine,
            emitAnnotation: fullContext.emitAnnotation,
        };
        
        // Special handling for class context
        if (hookContext.classType && renderer?.topLevels) {
            const isTopLevel = Array.from(renderer.topLevels.values()).includes(hookContext.classType);
            context.currentClass = {
                name: hookContext.className,
                type: hookContext.classType,
                isTopLevel
            };
        }
        
        // Special handling for property context
        if (hookContext.propertyName !== undefined && hookContext.jsonName !== undefined) {
            context.currentProperty = {
                name: hookContext.propertyName as any,
                jsonName: hookContext.jsonName,
                type: null as any,
                required: true
            };
        }
        
        for (const plugin of enabledPlugins) {
            // Run the hook if it exists
            const hook = (plugin.hooks as any)[hookName];
            if (typeof hook === 'function') {
                hook(context);
            }
        }
    }
}

// Global instance
export const globalPluginRunner = new GlobalPluginRunner();