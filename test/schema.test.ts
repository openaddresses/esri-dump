import EsriDump from '../index.js';
import test from 'tape';

test('FeatureServer Schema', async (t) => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/0';

    const esri = new EsriDump(url);
    const schema = await esri.schema();


    t.deepEquals(schema, {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {
            objectid: { type: 'number' },
            rotation: { type: 'integer' },
            description: { type: 'string', maxLength: 75 },
            eventdate: { type: 'string', format: 'date-time', maxLength: 8 },
            eventtype: { type: 'integer' },
            created_user: { type: 'string', maxLength: 255 },
            created_date: { type: 'string', format: 'date-time', maxLength: 8 },
            last_edited_user: { type: 'string', maxLength: 255 },
            last_edited_date: { type: 'string', format: 'date-time', maxLength: 8 }
        }
    });

    t.end();
});
