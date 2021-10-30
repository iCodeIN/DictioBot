import "https://deno.land/x/dotenv@v3.0.0/load.ts";
import { cleanEnv, str } from "https://deno.land/x/envalid@v0.0.2/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str({ desc: "Bot token from @BotFather on Telegram." }),
});
