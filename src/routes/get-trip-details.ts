import { FastifyInstance } from "fastify";

import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";

export async function getTripDetails(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
        },
    }, async (request) => {
        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            select: {
                id: true,
                destination: true,
                start_at: true,
                ends_at: true,
                is_confirmed: true,   
            },
            where: {
                id: tripId
            },
        });

        if (!trip) {
            throw new Error("Trip not found");
        }

        return { trip }
    });
}