
import * as dotenv from "dotenv";
import * as zod from "zod";


const DOTENV_SCHEMA = zod.object({
    // Token: APPLICATION_ID_STRING.32_BITS.SIGNATURE_224_BITS, base64url
    DISCORD_BOT_TOKEN: zod.string().regex(/^[A-Za-z0-9-_]+={0,2}\.[A-Za-z0-9-_]+={0,2}.[A-Za-z0-9-_]{38}$/),
    DISCORD_BOT_APPLICATION_ID: zod.string().regex(/^\d+$/)
});

const env = DOTENV_SCHEMA.parse(dotenv.config().parsed);

// Validate env
const tokenAppId = atob(env.DISCORD_BOT_TOKEN.split('.').shift()!);
if(tokenAppId != env.DISCORD_BOT_APPLICATION_ID) {
    console.log(`${tokenAppId} != ${env.DISCORD_BOT_APPLICATION_ID}`);
    throw new Error(`env.DISCORD_BOT_TOKEN is not for env.DISCORD_BOT_APPLICATION_ID application.`);
}

export default env;
