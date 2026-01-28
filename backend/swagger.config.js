const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ALITO Gestor de Carnets API',
            version: '1.0.0',
            description: 'API for managing employee access cards and statuses for ALITO.',
            contact: {
                name: 'ALITO Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server',
            },
        ],
        components: {
            schemas: {
                Employee: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'E001' },
                        name: { type: 'string', example: 'Juan Perez' },
                        company: { type: 'string', example: 'ALITO EIRL' },
                        docId: { type: 'string', example: '001-0000000-0' },
                        jobTitle: { type: 'string', example: 'Supervisor' },
                        notes: { type: 'string', example: 'Reportó pérdida de carnet' },
                    },
                },
                EmployeeState: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'E001' },
                        state: {
                            type: 'object',
                            properties: {
                                pc_status: {
                                    type: 'string',
                                    enum: ['NONE', 'ACTIVE', 'PROCESSING', 'RENEWAL', 'PENDING_UPDATE', 'PAYMENT_PENDING'],
                                    description: 'Status of Punta Cana Pass'
                                },
                                pc_expires: { type: 'string', format: 'date', description: 'Expiration Date' },
                                pc_requested: { type: 'string', format: 'date', description: 'Request Date' },
                                cc_status: {
                                    type: 'string',
                                    enum: ['NONE', 'ACTIVE', 'PROCESSING', 'RENEWAL', 'PENDING_UPDATE', 'PAYMENT_PENDING'],
                                    description: 'Status of Cap Cana Pass'
                                },
                                cc_expires: { type: 'string', format: 'date', description: 'Expiration Date' },
                                cc_requested: { type: 'string', format: 'date', description: 'Request Date' },
                                excluded: { type: 'boolean', description: 'Is employee excluded?' },
                            },
                        },
                    },
                },
            },
        },
    }, // Close definition
    apis: ['./server.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;
