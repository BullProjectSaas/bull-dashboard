# Setup manual — área de Finanzas

El área de Finanzas necesita 3 cosas del lado de Firebase Console que no puedo hacer yo (no
tengo acceso a la consola del proyecto). Son pasos de una sola vez.

## 1. Activar el método de login por email/contraseña

Firebase Console → proyecto `bull-dashboard-e6866` → **Authentication** → pestaña **Sign-in
method** → habilitar **Email/Password**.

## 2. Crear una cuenta por cada directivo

Authentication → pestaña **Users** → **Add user**. Un email + contraseña por persona (nada de
contraseña compartida, a diferencia del resto del panel).

## 3. Publicar las reglas de seguridad de Firestore

Firestore Database → pestaña **Rules** → reemplazar el contenido por el de
[`firestore.rules`](./firestore.rules) de este repo, **cambiando antes** la lista de emails de
`isDirectivo()` por los emails reales que cargaste en el paso 2 → **Publish**.

Sin este paso, cualquiera que sepa leer el código del sitio podría escribir directo en las
colecciones de Finanzas sin pasar por el login — las reglas son la protección real, no el login
en sí.

---

Una vez hechos estos 3 pasos, cualquier directivo puede entrar a **Panel interno → Finanzas**
con su email y contraseña. La primera vez que alguien entra va a ver un cartel para
"Inicializar configuración" (carga las tablas fijas de tramos/niveles/escalones/ISA) — se hace
una sola vez.
