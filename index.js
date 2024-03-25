const { jsonParser, setCorsHeaders, urlencoded } = require("./middleware");
const line = require("@line/bot-sdk");
const dotenv = require("dotenv");
const express = require("express");
const env = dotenv.config().parsed;
const app = express();
const axios = require("axios");

app.use(urlencoded);
app.use(setCorsHeaders);

const lineConfig = {
  channelAccessToken: env.ACCESSTOKEN,
  channelSecret: env.SECRETTOKEN,
};
const client = new line.Client(lineConfig);

//test server
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    console.log("event =>>>>", events);
    return events.length > 0
      ? await events.map((item) => handleEvent(item))
      : res.status(200).send("OK");
  } catch (error) {
    res.status(500).end();
  }
});

const handleEvent = async (event) => {
  const replyToken = event.replyToken;
  const userID = event.source.userId;
  const eventTypes = event.type;

  if (eventTypes == "message") {
    //when user send text video emoji pictures
    if (event.message.type == "text") {
      const text = event.message.text;

      if (text.includes("/openCase")) {
        // split text with , and " "
        const arr = text.split(/\s|,/);
        const requestDetail = arr[1];
        const email = arr[2];
        createMondayItem(requestDetail, email);

        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "Thank you for submit issue report.",
        });
      } 
      return;
    }
  }
};

function createMondayItem(itemName, email) {
  // GraphQL endpoint URL
  const graphqlEndpoint = "https://api.monday.com/v2";
  const columnValues = `{\"text74\": \"${email}\"}`;

  // GraphQL mutation without column_values
  const graphqlMutation = `
    mutation createItem($itemName: String!, $columnValues: JSON!) {
      create_item (
        board_id: "1844778052",
        group_id: "topics",
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  // Axios POST request configuration
  const axiosConfig = {
    method: "post",
    url: graphqlEndpoint,
    headers: {
      "Content-Type": "application/json",
      Authorization: env.MONDAY_API_KEY,
    },
    data: {
      query: graphqlMutation,
      variables: {
        itemName: itemName,
        columnValues: columnValues,
      },
    },
  };

  // Send the Axios request
  axios(axiosConfig)
    .then((response) => {
      // Handle the response
      console.log(response.data);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error:", error);
    });
}

app.listen(8080, () => {
  console.log("listening on 8080");
});
