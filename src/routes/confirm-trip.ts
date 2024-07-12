import { FastifyInstance } from "fastify";

import dayjs from "dayjs";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";


export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        });

        if (!trip) {
            throw new Error("Trip not found");
        }

        if (trip.is_confirmed) {
            return reply.redirect(`http://localhost:3000/trips/${tripId}/confirmed`)
        }

        await prisma.trip.update({
            where: { id: tripId },
            data: { is_confirmed: true }
        })

        const formattedStartDate = dayjs(trip.start_at).format("DD/MM/YYYY");
        const formattedEndDate = dayjs(trip.ends_at).format("DD/MM/YYYY");


        const mail = await getMailClient();

        await Promise.all(
            trip.participants.map(async (participant) => {
                const confirmationLink = `http://localhost:3000/participants/${participant.id}/confirm`;

                const message = await mail.sendMail({
                    from: {
                        name: "Trip Planner - Equipe",
                        address: "equipe.planner@plann.er"
                    },
                    to: participant.email,
                    subject: `Confirme sua viagem para ${trip.destination}!`,
                    html: `
                        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                            <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
                            <p></p>
                            <p>Para confirmar sua viagem, clique no link abaixo:</p>
                            <p></p>
                            <p>
                                <a href="${confirmationLink}">Confirmar viagem</a>
                            </p>
                            <p></p>
                            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore.</p>
                        </div>
                    `.trim()
                });
        
                console.log(nodemailer.getTestMessageUrl(message));
            })
        )

        return reply.redirect(`http://localhost:3000/trips/${tripId}`)
    });
}