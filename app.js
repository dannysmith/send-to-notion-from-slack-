const { App, LogLevel } = require("@slack/bolt");
const { Client } = require('@notionhq/client');


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = '5a395774-8b4a-4111-8b53-6161ac34f2a3';

app.shortcut('create_notion_record', async ({ ack, payload, client }) => {

  try {
    // Acknowledge shortcut request
    await ack();

    // console.log(payload);
    
    // Get permalink to message
    const permalinkResult = await client.chat.getPermalink({
        channel: payload.channel.id,
        message_ts: payload.message.ts,
      });
    
    // Get abailable databases
    const listOfDatabases = await notion.databases.list();
    const databases = listOfDatabases.results.map((database) => {
      return {id: database.id, name: database.title[0].text.content}
    })
    console.log(databases)
    
    // Show Modal
     const modalResult = await client.views.open({
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
    
    
    // Create notion page
    // const response = await notion.pages.create({
    //     parent: {
    //       database_id: databaseId,
    //     },
    //     properties: {
    //       Name: {
    //         title: [
    //           {
    //             text: {
    //               content: 'New Task',
    //             },
    //           },
    //         ],
    //       },
    //     },
    //     children: [
    //       {
    //         object: 'block',
    //         type: 'paragraph',
    //         paragraph: {
    //           text: [
    //             {
    //               type: 'text',
    //               text: {
    //                 content: payload.message.text,
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         object: 'block',
    //         type: 'paragraph',
    //         paragraph: {
    //           text: [
    //             {
    //               type: 'text',
    //               text: {
    //                 content: "Original Slack Message",
    //                  link: {
    //                   url: permalinkResult.permalink
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //   });
    
  }
  catch (error) {
    console.error(error);
  }
});



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
