import type { Name, Type, OptionDefinition, Sourcelike } from "quicktype-core";

export interface PluginContext {
    language: string;
    framework?: string;
    options: Record<string, any>;
    
    // Current generation context
    currentClass?: {
        name: Name;
        type: Type;
        isTopLevel: boolean;
    };
    
    currentProperty?: {
        name: Name;
        jsonName: string;
        type: Type;
        required: boolean;
    };
    
    // Methods to emit code
    emit: (code: Sourcelike) => void;
    emitLine: (code: Sourcelike) => void;
    emitAnnotation: (annotation: string) => void;
}

export interface PluginHooks {
    // Modify CLI options
    beforeOptions?: (options: OptionDefinition[]) => OptionDefinition[];
    
    // Modify imports
    afterImports?: (context: PluginContext) => void;
    
    // Add class annotations
    beforeClass?: (context: PluginContext) => void;
    afterClass?: (context: PluginContext) => void;
    
    // Add property annotations  
    beforeProperty?: (context: PluginContext) => void;
    afterProperty?: (context: PluginContext) => void;
    
    // Transform the final output
    transformOutput?: (output: string, context: PluginContext) => string;
}

export interface QuicktypePlugin {
    name: string;
    version: string;
    description: string;
    
    // Which languages/frameworks this plugin supports
    supports: {
        languages?: string[];
        frameworks?: string[];
    };
    
    // Plugin hooks
    hooks: PluginHooks;
}

export interface PluginMetadata {
    name: string;
    version: string;
    description: string;
    author?: string;
    repository?: string;
    main?: string;
}