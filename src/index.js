import fetch from "node-fetch";
import { load } from "cheerio";
import * as dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const parse = (content) => {
  let result = "\n-------------\nIN STOCK MOFI\n-------------\n";

  for (let i = 0; i < content.length; i++) {
    const text = $(content[i]).text();
    const title = text.split("-")[1].trim();

    if (FILTERS.ALBUMS.includes(title)) {
      continue;
    } else {
      result += `${text}\n`;
    }
  }
  return result;
};

const FILTERS = {
  ALBUMS: ["Milestones", "Sketches of Spain", "A Tribute to Jack Johnson"],
};

const response = await fetch(
  "https://mofi.com/collections/back-in-stock/vinyl"
);
const body = await response.text();
const $ = load(body);
const items = $(".product-item__title a");
const result = parse(items);
console.log(result);

const {
  FROM_PHONE_NUMBER,
  TO_PHONE_NUMBER,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
} = process.env;

// const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// client.messages
//   .create({
//     body: result,
//     to: TO_PHONE_NUMBER,
//     from: FROM_PHONE_NUMBER,
//   })
//   .then((message) => console.log(message.sid));
