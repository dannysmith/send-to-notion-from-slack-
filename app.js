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

    console.log(payload);
    
    // Get permalink to message
    const permalinkResult = await client.chat.getPermalink({
        channel: payload.channel.id,
        message_ts: payload.message.ts,
      });
    
    // Get abailable databases
    const listOfDatabases = await notion.databases.list();
    const databases = listOfDatabases.results.map((database) =>
      {id: database.id, name: database.title[0].text.content}
    )
    console.log(databases)
    
    // Create notion page
    const response = await notion.pages.create({
        parent: {
          database_id: databaseId,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: 'New Task',
                },
              },
            ],
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              text: [
                {
                  type: 'text',
                  text: {
                    content: payload.message.text,
                  },
                },
              ],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              text: [
                {
                  type: 'text',
                  text: {
                    content: "Original Slack Message",
                     link: {
                      url: permalinkResult.permalink
                    },
                  },
                },
              ],
            },
          },
        ],
      });
    
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
