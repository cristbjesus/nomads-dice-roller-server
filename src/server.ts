require('dotenv').config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { StreamChat } from 'stream-chat';

import { config } from './config/config';

(async () => {

  const app = express();
  const port = process.env.PORT || 8082;
  
  const serverSideClient = StreamChat.getInstance(
    config.stream_api_key,
    config.stream_app_secret
  );

  // CORS
  app.use(cors({
    allowedHeaders: [ 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization' ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    origin: `http://${config.aws_website_bucket}.s3-website-${config.aws_region}.amazonaws.com`
  }));

  app.use(bodyParser.json());

  // Root URI call
  app.get('/', (_req, res) => {
    res.json();
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
      await channel.addMembers([ characterId ]);
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

    return res.json();
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`Server running on PORT ${port}`);
    console.log('press CTRL+C to stop server');
  });
})();