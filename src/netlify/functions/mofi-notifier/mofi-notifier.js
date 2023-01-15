import twilio from "twilio";
import cheerio from "cheerio";
import { schedule } from "@netlify/functions";

const parse = (content, $) => {
  let result = "\n-------------\nIN STOCK MOFI\n-------------\n";

  for (let i = 0; i < content.length; i++) {
    const text = $(content[i]).text();
    const title = text.split("-")[1].trim().toLowerCase();

    if (FILTERS.ALBUMS.includes(title)) {
      continue;
    } else {
      result += `${text}\n`;
    }
  }
  return result;
};

const FILTERS = {
  ALBUMS: [
    "milestones",
    "sketches of spain",
    "a tribute to jack johnson",
    "in a silent way",
  ],
};

const handler = async function (event, context) {
  const response = await fetch(
    "https://mofi.com/collections/back-in-stock/vinyl"
  );
  const body = await response.text();
  const $ = cheerio.load(body);
  const items = $(".product-item__title a");
  const parsed = parse(items, $);
  const {
    FROM_PHONE_NUMBER,
    TO_PHONE_NUMBER,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
  } = process.env;

  const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: parsed,
    to: TO_PHONE_NUMBER,
    from: FROM_PHONE_NUMBER,
  });

  return {
    statusCode: 200,
    body: "sent",
  };
};

exports.handler = schedule("10 13 * * *", handler);
