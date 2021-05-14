// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/helloworld', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  // Respond with a canned message
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: payload.channel_id,
      text: 'Message from Oyster Notion Bot'
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

//     console.log(result);
    
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
