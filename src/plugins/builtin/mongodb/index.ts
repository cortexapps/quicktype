import type { QuicktypePlugin, PluginContext } from "../../PluginInterface";
import type { OptionDefinition } from "quicktype-core";

class MongoDBPlugin implements QuicktypePlugin {
    name = "mongodb";
    version = "1.0.0";
    description = "Add MongoDB annotations for Spring Data";
    
    supports = {
        languages: ["kotlin", "java"]
        // Don't check frameworks - Java uses Jackson by default, Kotlin requires --framework jackson
    };
    
    hooks = {
        beforeOptions: (options: OptionDefinition[]) => {
            return [...options, {
                name: "mongo-collection",
                alias: "m",
                optionType: "string" as const,
                typeLabel: "COLLECTION",
                description: "MongoDB collection name for @Document annotation",
            } as OptionDefinition];
        },
        
        afterImports: (context: PluginContext) => {
            if (context.options["mongo-collection"]) {
                context.emitLine("");
                if (context.language === "java") {
                    context.emitLine("import org.springframework.data.mongodb.core.mapping.Document;");
                    context.emitLine("import org.springframework.data.mongodb.core.mapping.Field;");
                } else if (context.language === "kotlin") {
                    context.emitLine("import org.springframework.data.mongodb.core.mapping.Document");
                    context.emitLine("import org.springframework.data.mongodb.core.mapping.Field");
                }
            }
        },
        
        beforeClass: (context: PluginContext) => {
            const mongoCollection = context.options["mongo-collection"];
            if (mongoCollection && context.currentClass?.isTopLevel) {
                context.emitAnnotation(`@Document("${mongoCollection}")`);
            }
        },
        
        beforeProperty: (context: PluginContext) => {
            if (context.options["mongo-collection"] && context.currentProperty) {
                // Only add @Field if the property name differs from the JSON name
                const propName = String(context.currentProperty.name);
                if (propName !== context.currentProperty.jsonName) {
                    context.emitAnnotation(`@Field("${context.currentProperty.jsonName}")`);
                }
            }
        }
    };
}

export default new MongoDBPlugin();