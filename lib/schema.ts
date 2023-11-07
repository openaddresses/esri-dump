import { JSONSchema6 } from 'json-schema';

// Ref: https://help.arcgis.com/en/sdk/10.0/java_ao_adf/api/arcgiswebservices/com/esri/arcgisws/EsriFieldType.html
const Types: Map<string, JSONSchema6> = new Map([
    ['esriFieldTypeDate', { type: 'string', format: 'date-time' }],
    ['esriFieldTypeString', { type: 'string' }],
    ['esriFieldTypeDouble', { type: 'number' }],
    ['esriFieldTypeSingle', { type: 'number' }],
    ['esriFieldTypeOID', { type: 'number' }],
    ['esriFieldTypeInteger', { type: 'integer' }],
    ['esriFieldTypeSmallInteger', { type: 'integer' }],
    ['esriFieldTypeGeometry', { type: 'object' }],
    ['esriFieldTypeBlob', { type: 'object' }],
    ['esriFieldTypeGlobalID', { type: 'string' }],
    ['esriFieldTypeRaster', { type: 'object' }],
    ['esriFieldTypeGUID', { type: 'string' }],
    ['esriFieldTypeXML', { type: 'string' }],
]);

export default function FieldToSchema(metadata: any): JSONSchema6 {
    const doc: JSONSchema6 = {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {}
    }

    if (!metadata.fields && !Array.isArray(metadata.fields)) {
        return doc;
    }

    for (const field of metadata.fields) {
        const name = String(field.name);

        const type: JSONSchema6 = Types.has(field.type) ? Types.get(field.type) : { type: 'string' };

        const prop: JSONSchema6 = doc.properties[name] = {
            ...JSON.parse(JSON.stringify(type))
        }

        if (!isNaN(field.length) && type.type === 'string') {
            prop.maxLength = field.length;
        }
    }

    return doc;
}
