import {
  Bot,
  InlineKeyboard,
  InputFile,
} from "https://deno.land/x/grammy@v1.3.3/mod.ts";
import { translate } from "./api.ts";
import { resultsToText } from "./utils.ts";
import env from "./env.ts";

const bot = new Bot(env.BOT_TOKEN);

let cachedPhoto: string;

bot.command("start", async (ctx) => {
  const { photo } = await ctx.replyWithPhoto(
    cachedPhoto ? cachedPhoto : new InputFile(await Deno.readFile("photo.png")),
    {
      caption:
        'Hey! I search through <a href="https://dictio.kurditgroup.org/dictio/">the Dictio dictionary</a> and give you the results faster than you do with a browser, without leaving Telegram! Just send me the text which you would like to search for, and I’ll come back to you with the results in the matter of nanoseconds. I also work inline, so you can use me anywhere without breaking the train of your thoughts.\n\n' +
        'سڵاو! من لە ناو <a href="https://dictio.kurditgroup.org/dictio/">فەرهەنگی دیکتیۆ</a> بۆ ئەو شتە دەگەڕێم کە دەتەوێت و لە خۆت خێراتر ئەنجامەکانت دەدەمەوە! تەنیا ئەو نووسینە بنێرە کە دەتەوێت بۆی بگەڕێیت و بە چاو تروکاندنێکت هەموو ئەنجامەکان لەبەردەمتن.',
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().switchInline("Inline Mode"),
    }
  );

  if (!cachedPhoto) cachedPhoto = photo[photo.length - 1].file_id;
});

bot.on("inline_query", async (ctx) => {
  const input = ctx.inlineQuery.query;

  // I preferred to be just silent. Or is there a way of speaking?
  if (!input || input.length > 20) return;

  const results = await translate(input);

  if (results.length == 0) return;

  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: String(Date.now()),
        title: input,
        input_message_content: {
          message_text: resultsToText(results),
        },
      },
    ],
    { cache_time: 36000 } // :)
  );
});

bot.on(["message:text", "message:caption"], async (ctx) => {
  const input = ctx.message.text || ctx.message.caption;

  if (!input) return;

  if (input.length > 20) {
    await ctx.reply("The text is too long.\n\nنووسینەکە زۆر درێژە.");
    return;
  }

  const results = await translate(input);

  if (results.length == 0) {
    await ctx.reply("No results found.\n\nهیچ نەدۆزرایەوە.");
    return;
  }

  await ctx.reply(resultsToText(results));
});

await bot.start();
