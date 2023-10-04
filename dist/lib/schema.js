// Ref: https://help.arcgis.com/en/sdk/10.0/java_ao_adf/api/arcgiswebservices/com/esri/arcgisws/EsriFieldType.html
const Types = new Map([
    ['esriFieldTypeDate', 'string'],
    ['esriFieldTypeString', 'string'],
    ['esriFieldTypeDouble', 'number'],
    ['esriFieldTypeSingle', 'number'],
    ['esriFieldTypeOID', 'number'],
    ['esriFieldTypeInteger', 'integer'],
    ['esriFieldTypeSmallInteger', 'integer'],
    ['esriFieldTypeGeometry', 'object'],
    ['esriFieldTypeBlob', 'object'],
    ['esriFieldTypeGlobalID', 'string'],
    ['esriFieldTypeRaster', 'object'],
    ['esriFieldTypeGUID', 'string'],
    ['esriFieldTypeXML', 'string'],
]);
export default function FieldToSchema(metadata) {
    const doc = {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {}
    };
    if (!metadata.fields && !Array.isArray(metadata.fields)) {
        return doc;
    }
    for (const field of metadata.fields) {
        const name = String(field.name);
        const type = Types.has(field.type) ? Types.get(field.type) : 'string';
        const prop = doc.properties[name] = {
            type
        };
        if (!isNaN(field.length) && type === 'string') {
            prop.maxLength = field.length;
        }
    }
    return doc;
}
//# sourceMappingURL=schema.js.map