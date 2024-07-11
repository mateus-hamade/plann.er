import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';

import { confirmTrip } from './routes/confirm-trip';
import { createTrip } from './routes/create-trip';

const app = fastify();

app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true
});

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(confirmTrip);
app.register(createTrip);

app.listen({port: 3000}).then(() => {
    console.log('Server is running on port 3000');
});