import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';

import { confirmTrip } from './routes/confirm-trip';
import { createTrip } from './routes/create-trip';
import { confirmParticipants } from './routes/confirm-participant';
import { createActivity } from './routes/create-activity';
import { getActivity } from './routes/get-activities';
import { createLink } from './routes/create-links';
import { getLinks } from './routes/get-links';
import { getParticipants } from './routes/get-participants';
import { createInvite } from './routes/create-invite';
import { updateTrip } from './routes/update-trip';
import { getTripDetails } from './routes/get-trip-details';
import { getParticipant } from './routes/get-participant';

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
app.register(confirmParticipants);
app.register(createActivity);
app.register(getActivity);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);

app.listen({port: 3000}).then(() => {
    console.log('Server is running on port 3000');
});