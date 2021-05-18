// Require the Bolt package (github.com/slackapi/bolt)
const { App, LogLevel } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

app.command('/helloworld', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  // Respond with a canned message
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: payload.channel_id,
      text: 'Message from Oyster Notion Bot!!!'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});


app.shortcut('open_modal', async ({ ack, payload, client }) => {
  // Acknowledge shortcut request
  ack();

  try {
    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "My App"
        },
        "close": {
          "type": "plain_text",
          "text": "Close"
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// All the room in the world for your code
// app.shortcut('create_notion_record', async ({ shortcut, ack, client }) => {

//   try {
//     // Acknowledge shortcut request
//     await ack();

//     console.log(shortcut);
    
//   }
//   catch (error) {
//     console.error(error);
//   }
// });



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
