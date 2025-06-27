import type { QuicktypePlugin, PluginContext, PluginHooks } from "./PluginInterface";
import type { OptionDefinition } from "quicktype-core";
import mongoDBPlugin from "./builtin/mongodb";

export class PluginRegistry {
    private plugins: Map<string, QuicktypePlugin> = new Map();
    private enabledPlugins: Set<string> = new Set();
    
    constructor() {
        // Register built-in plugins
        this.registerPlugin(mongoDBPlugin);
        
        // Enable MongoDB plugin by default for now
        this.enablePlugin("mongodb");
    }
    
    registerPlugin(plugin: QuicktypePlugin): void {
        this.plugins.set(plugin.name, plugin);
    }
    
    enablePlugin(name: string): void {
        if (this.plugins.has(name)) {
            this.enabledPlugins.add(name);
        } else {
            throw new Error(`Plugin "${name}" not found`);
        }
    }
    
    disablePlugin(name: string): void {
        this.enabledPlugins.delete(name);
    }
    
    getPlugin(name: string): QuicktypePlugin | undefined {
        return this.plugins.get(name);
    }
    
    getEnabledPlugins(language: string, framework?: string): QuicktypePlugin[] {
        const enabled: QuicktypePlugin[] = [];
        
        for (const name of this.enabledPlugins) {
            const plugin = this.plugins.get(name);
            if (!plugin) continue;
            
            // Check if plugin supports this language/framework
            const supportsLanguage = !plugin.supports.languages || 
                                   plugin.supports.languages.includes(language);
            const supportsFramework = !plugin.supports.frameworks || 
                                    plugin.supports.frameworks.includes(framework as any);
            
            if (supportsLanguage && supportsFramework) {
                enabled.push(plugin);
            }
        }
        
        return enabled;
    }
    
    // Execute hooks for all enabled plugins
    executeHook<K extends keyof PluginHooks>(
        hookName: K,
        context: PluginContext,
        ...args: Parameters<NonNullable<PluginHooks[K]>>
    ): void {
        const plugins = this.getEnabledPlugins(context.language, context.framework);
        
        for (const plugin of plugins) {
            const hook = plugin.hooks[hookName];
            if (hook) {
                (hook as any).apply(null, args);
            }
        }
    }
    
    // Special handling for beforeOptions hook - always include all plugin options
    // so they can be parsed from CLI
    modifyOptions(options: OptionDefinition[], _language: string): OptionDefinition[] {
        let modifiedOptions = [...options];
        
        // Load all plugins for option definitions
        // For CLI parsing, we need to include all plugin options regardless of language
        for (const plugin of this.plugins.values()) {
            if (plugin.hooks.beforeOptions) {
                // Always add options for CLI parsing
                modifiedOptions = plugin.hooks.beforeOptions(modifiedOptions);
            }
        }
        
        return modifiedOptions;
    }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistry();