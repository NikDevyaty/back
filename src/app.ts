import TelegramBot from 'node-telegram-bot-api';
import fabricHandlers from './appQueryHandlers/fabricHandlers';
import { BOT_NAME, MONGO_URL, PORT, mongooseOptions } from './lib/constants';
import User from './models/User';

const express = require('express') as typeof import('express');
const cors = require('cors');
const mongoose = require('mongoose') as typeof import('mongoose');

mongoose.connect(MONGO_URL, mongooseOptions);
const app = express();

app.use(express.json());
app.use(cors());

app.get('/user', async (req, res) => {
  fabricHandlers(req, res, async () => {
    const id = JSON.parse(req.query.user as string).id;
    const user = await User.findOne({ tgUserId: id });
    res.send({ data: { user } });
  })
});

app.post('/user', async (req, res) => {
  fabricHandlers(req, res, async () => {
    const { id, first_name, username, is_bot, language_code, last_name
    } = JSON.parse(req.query.user as string) as TelegramBot.User;

    await User.create({
      tgUserId: id,
      firstName: first_name,
      lastName: last_name || '',
      username: username || '',
      is_bot: is_bot || null,
      languageCode: language_code || '',
      dataGame: {
        name: req?.body?.dataGame?.name,
        byReferral: req.query?.start_param || null,
        referalLink: `${BOT_NAME}?startapp=${id}`
      }
    })
    const user = await User.findOne({ tgUserId: id });

    res.send({ data: { user } });
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});