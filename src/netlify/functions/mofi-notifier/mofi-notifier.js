const dotenv = require("dotenv");
const fetch = require("node-fetch");
const twilio = require("twilio");
const cheerio = require("cheerio");
const fns = require("@netlify/functions");

dotenv.config();

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

  const result = await client.messages.create({
    body: parsed,
    to: TO_PHONE_NUMBER,
    from: FROM_PHONE_NUMBER,
  });

  return {
    statusCode: 200,
    body: result.status,
  };
};

exports.handler = fns.schedule("30 12 * * *", handler);