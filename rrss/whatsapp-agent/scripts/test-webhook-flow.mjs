#!/usr/bin/env node
/** Prueba local: simula mensaje Meta y opcionalmente vía ngrok. */
import { config } from "../lib/config.mjs";

const payload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1519931339630253",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: { phone_number_id: config.phoneNumberId },
            messages: [
              {
                from: "56974533265",
                id: `test-${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                type: "text",
                text: {
                  body: "Hola, vi la oferta de Búsqueda personalizada. [Ref: LA-BUSQ30]",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

const local = await fetch("http://localhost:8787/webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
console.log("Local webhook:", local.status, await local.text());

const ngrok = process.env.NGROK_URL || "https://professor-drapery-uplifting.ngrok-free.dev";
const ext = await fetch(`${ngrok}/webhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "1",
  },
  body: JSON.stringify(payload),
});
console.log("Ngrok webhook:", ext.status, (await ext.text()).slice(0, 200));
