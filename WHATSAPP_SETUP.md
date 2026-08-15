# POC 1 — Conexión WhatsApp Cloud API (oficial)

Este documento cubre el primer circuito del acta de Bull CRM: recibir y responder
mensajes de WhatsApp dentro del dashboard, usando la **WhatsApp Business Platform /
Cloud API** de Meta (sin QR, sin WhatsApp Web, sin scraping).

No hay "escaneo de QR": en el flujo oficial vos le escribís por WhatsApp normal
(desde tu celular) a un número que administra Meta, y ese mensaje llega a un
webhook propio. Recién más adelante, cuando quieran producción, se conecta el
número real del cliente vía Embedded Signup (sección 17 del acta) — para el POC
alcanza con el número de prueba gratuito que da Meta.

## 1. Crear la app en Meta for Developers

1. Entrá a https://developers.facebook.com/apps y creá una app de tipo **Business**.
2. Agregá el producto **WhatsApp** desde el panel de productos.
3. En `WhatsApp > Configuración de la API`, vas a ver:
   - Un **número de prueba** ya asignado (gratis, sirve para el POC).
   - Un **Phone Number ID**.
   - Un **token de acceso temporal** (dura 24hs — para pruebas alcanza; luego se
     reemplaza por un token permanente de un System User).
4. En esa misma pantalla podés agregar hasta 5 números de teléfono destinatarios
   de prueba (tu propio WhatsApp) para poder chatear con el número de Meta.

## 2. Deployar las Cloud Functions

El repo ya incluye `functions/whatsappWebhook` (recibe mensajes) y
`functions/sendWhatsappMessage` (envía mensajes desde el CRM).

```bash
npm install -g firebase-tools   # si no lo tenés
firebase login
cd functions && npm install && cd ..
```

Configurá los secrets (Firebase te va a pedir que actives Secret Manager la
primera vez, es automático):

```bash
firebase functions:secrets:set WHATSAPP_TOKEN            # el token temporal del paso 1
firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID   # el Phone Number ID del paso 1
firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN      # inventá un string random vos, ej: openssl rand -hex 16
firebase functions:secrets:set APP_SHARED_SECRET          # otro string random, protege el endpoint de envío
```

Deployá:

```bash
firebase deploy --only functions
```

Vas a obtener dos URLs, algo así:

```
https://us-central1-bull-dashboard-e6866.cloudfunctions.net/whatsappWebhook
https://us-central1-bull-dashboard-e6866.cloudfunctions.net/sendWhatsappMessage
```

## 3. Configurar el webhook en Meta

1. En `WhatsApp > Configuración > Webhook`, cargá:
   - **Callback URL**: la URL de `whatsappWebhook` de arriba.
   - **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`.
2. Verificá (Meta hace un GET automático — si falla, revisá que el secret
   coincida exactamente).
3. Suscribite al campo **`messages`** (es el que trae texto, audio, imagen,
   documentos, y el objeto `referral` con `ctwa_clid`/`source_id` cuando el
   contacto viene de un anuncio Click-to-WhatsApp).

## 4. Configurar el frontend

```bash
cp .env.example .env
```

Completá `.env` con la URL de `sendWhatsappMessage` y el mismo valor de
`APP_SHARED_SECRET` que configuraste en el paso 2.

```bash
npm run dev
```

Entrá a `http://localhost:5173/#admin`, iniciá sesión con la contraseña del
panel interno, y abrí la pestaña **WhatsApp**.

## 5. Probar el circuito

1. Desde tu celular, escribile por WhatsApp al número de prueba de Meta.
2. El mensaje debería aparecer en la pestaña WhatsApp del dashboard en tiempo
   real (Firestore `onSnapshot`, sin refrescar).
3. Respondé desde el dashboard — debería llegarte a tu WhatsApp.
4. Enviá un audio o una imagen desde tu celular: por ahora el inbox lo muestra
   como `[audio]` / `[imagen]` (el guardado/reproducción de archivos multimedia
   es el siguiente paso, no está en este POC).

Esto valida **POC 1** del acta (WhatsApp) completo.

## 6. Siguiente paso: POC 2 (atribución Click-to-WhatsApp)

Para probar la atribución hay que crear una campaña real de Meta Ads con
formato Click-to-WhatsApp apuntando a este mismo número de prueba, y hacer un
click real desde un dispositivo de test. El campo `referral` que llega en el
webhook (`ctwa_clid`, `source_id`, `headline`, etc.) ya se guarda automáticamente
en `conversations/{waId}.attribution` — se puede ver reflejado en el inbox como
el badge "📎 Click-to-WhatsApp". El siguiente paso técnico (no incluido todavía)
es cruzar esos IDs contra la Marketing API para resolver Campaign/Ad Set/Ad.

## Notas de seguridad (importante antes de producción)

- Las reglas de Firestore de la colección `conversations` deben restringirse
  (hoy siguen el mismo criterio "no es seguridad real" que el resto del panel
  interno — ver `src/utils/auth.js`). Antes de sumar clientes reales conviene
  pasar a Firebase Authentication + reglas por `organization_id`, tal como
  pide la sección 16 del acta (multi-tenant).
- El token temporal de WhatsApp vence en 24hs. Para dejarlo estable, generar un
  token permanente desde un System User en Meta Business Suite.
- `APP_SHARED_SECRET` es una protección mínima para el endpoint de envío, no
  reemplaza autenticación real de usuarios/vendedores — eso es parte del MVP
  posterior (login, roles, sección 23 del acta).
