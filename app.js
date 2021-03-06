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

app.view('save_notion_card', async ({ ack, body, view, client }) => {
  // Acknowledge shortcut request
  await ack();

  // CGet data from form submission
  const databaseId = body.view.state.values.notion_database['notion_database-action'].selected_option.value
  const cardTitle = body.view.state.values.card_title['card_title-action'].value
  const message = body.view.state.values.message_text['message_text-action'].value
  const [channelID, messageTS] = body.view.private_metadata.split('+')

  // Get permalink to message
  const permalinkResult = await client.chat.getPermalink({
      channel: channelID,
      message_ts: messageTS,
    });

  // Get title field of Database
  const notionDatabase = await notion.databases.retrieve({ database_id: databaseId });

  function findTitleField(props) {
    const index = Object.values(props).findIndex((el) => el.id === 'title')
    return Object.keys(props)[index]
  }

  const titleField = findTitleField(notionDatabase.properties)

  // Create notion page
  const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        [titleField]: {
          title: [
            {
              text: {
                content: cardTitle,
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
                  content: message,
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

  const url = 'https://notion.so/' + response.id.split('-').join('')

  const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelID,
      thread_ts: messageTS,
      text: "Card Created in Notion :notion:\r\r" + url
    });

  console.log('Done')
})



app.shortcut('create_notion_record', async ({ ack, payload, client }) => {

  try {
    // Acknowledge shortcut request
    await ack();


    // Get abailable databases
    const listOfDatabases = await notion.databases.list();

    const databases = listOfDatabases.results.map((db) => {
      return {id: db.id, name: db.title[0].text.content}
    })

    const databaseOptionsForModal = databases.map((db) => {
      return {
                text: {
                  type: "plain_text",
                  text: db.name,
                  emoji: true
                },
                value: db.id
              }
    })
    console.log(databases)

    // Show Modal
     const modalResult = await client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: 'save_notion_card',
        private_metadata: `${payload.channel.id}+${payload.message.ts}`,
        title: {
          type: "plain_text",
          text: "Add Card to Notion",
          emoji: true
        },
        submit: {
          type: "plain_text",
          text: "Add Card",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Create a record in Notion from this message.",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "notion_database",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Choose an Database",
                emoji: true
              },
              options: databaseOptionsForModal,
              action_id: "notion_database-action"
            },
            label: {
              type: "plain_text",
              text: "Notion Database",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "card_title",
            element: {
              type: "plain_text_input",
              action_id: "card_title-action"
            },
            label: {
              type: "plain_text",
              text: "Card Title",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "message_text",
            element: {
              type: "plain_text_input",
              initial_value: payload.message.text,
              multiline: true,
              action_id: "message_text-action"
            },
            label: {
              type: "plain_text",
              text: "Details",
              emoji: true
            }
          }
        ]
      }});

  }
  catch (error) {
    console.error(error);
  }
});



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('?????? Bolt app is running!');
})();
