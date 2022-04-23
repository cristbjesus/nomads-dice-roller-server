import express from 'express';

import bodyParser from 'body-parser';
import { config } from './config/config';

import { StreamChat } from 'stream-chat';

(async () => {

  const app = express();
  const port = process.env.PORT || 8082;
  
  const serverSideClient = StreamChat.getInstance(
    config.stream_api_key,
    config.stream_app_secret
  );

  // CORS Should be restricted
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', `http://${config.aws_website_bucket}.s3-website-${config.aws_region}.amazonaws.com`);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, Authorization');
    res.header('Access-Control-Allow-Methods', '*');
    next();
  });


  app.use(bodyParser.json());

  // Root URI call
  app.get('/', (req, res) => {
    res.json(null);
  });

  // Join a channel
  app.post('/join', async (req, res) => {
    const { characterId, characterName } = req.body;
    const token = serverSideClient.createToken(characterId);

    try {
      await serverSideClient.upsertUser({ id: characterId, name: characterName });
    } catch (err) {
      console.log(err);
    }

    const channel = serverSideClient.channel('team', 'dicerollerchatchannel', { name: 'Dice Roller Channel' });

    try {
      await channel.create();
      await channel.addMembers([characterId]);
    } catch (err) {
      console.log(err);
    }

    return res.json({ token, api_key: config.stream_api_key });
  });

  // Delete a message from channel
  app.post('/delete-message', async (req, res) => {
    const { messageId } = req.body;

    try {
      serverSideClient.deleteMessage(messageId, true);
    } catch (err) {
      console.log(err);
    }

    return res.json(null);
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running ${config.url}`);
    console.log('press CTRL+C to stop server');
  });
})();