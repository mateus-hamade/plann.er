import { FastifyInstance } from "fastify";

import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";

export async function getActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
        },
    }, async (request) => {
        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                activities: {
                    orderBy: {
                        occurs_at: 'asc'
                    }
                }
            }
        });

        if (!trip) {
            throw new Error("Trip not found");
        }

        const differenceInDaysBetweenStartAndEnd = dayjs(trip.ends_at).diff(dayjs(trip.start_at), 'days');

        const activities = Array.from({ length: differenceInDaysBetweenStartAndEnd + 1 }).map((_, index) => {
            const date = dayjs(trip.start_at).add(index, 'days')

            return {
                date: date.toDate(),
                activities: trip.activities.filter(activity => dayjs(activity.occurs_at).isSame(date, 'day'))
            }
        })
 
        return {
            activities: activities
        }
    });
}