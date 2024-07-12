import { FastifyInstance } from "fastify";

import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";


export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params
        const { email } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            throw new Error("Trip not found");
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                trip_id: tripId
            }
        });

        const formattedStartDate = dayjs(trip.start_at).format("DD/MM/YYYY");
        const formattedEndDate = dayjs(trip.ends_at).format("DD/MM/YYYY");


        const mail = await getMailClient();
        
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

        return { participantId: participant.id }
    })
}