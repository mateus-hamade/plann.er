import { FastifyInstance } from "fastify";

import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma";


export async function createActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                title: z.string().min(4),
                occurs_at: z.coerce.date(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params
        const { title, occurs_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            throw new Error("Trip not found");
        }

        if (dayjs(occurs_at).isBefore(dayjs())) {
            throw new Error("Cannot create activity in the past");
        }

        if (dayjs(occurs_at).isAfter(dayjs(trip.ends_at))) {
            throw new Error("Cannot create activity after trip ends");
        }

        const activity = await prisma.activity.create({
            data: {
                title,
                occurs_at,
                tripId: tripId
            }
        });

        return {
            activityId: activity.id
        }
    });
}