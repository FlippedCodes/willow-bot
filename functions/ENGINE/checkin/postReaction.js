const moment = require('moment');

const userDoB = require('../../../database/models/UserDoB');

async function getDate(channel) {
  // get all messages
  const messages = await channel.messages.fetch();
  // match date
  const dateRegEx = /\d{2}[/]\d{2}[/]\d{4}/gm;
  const found = await messages.filter((msg) => msg.content.match(dateRegEx) && msg.author.id === channel.name);
  if (!found.size) return;
  const coreMessage = found.entries().next().value[1].content;
  const rawDate = coreMessage.match(dateRegEx)[0];
  return moment(rawDate, config.DoBchecking.dateFormats, true);
}

async function searchUser(ID) {
  const result = await userDoB.findOne({ where: { ID } }).catch(ERR);
  return result;
}

async function addUser(ID, DoB, allow, teammemberID) {
  if (await userDoB.findOne({ where: { ID } }).catch(ERR)) return false;
  await userDoB.findOrCreate({ where: { ID }, defaults: { DoB, allow, teammemberID } }).catch(ERR);
  return true;
}

module.exports.run = async (message) => {
  // check if team fore was pinged and if channel is a checkin channel
  if (message.mentions.roles.has(config.teamRole)
  && message.channel.parentId === config.checkin.categoryID) {
    await message.react('👌');
    await message.react('✋');
    client.functions.get('ENGINE_message_embed')
      .run(
        message.channel,
        'Please wait for a teammember to review your answers.',
        null,
        4296754,
        false,
      );
    if (await searchUser(message.author.id)) await message.react('🔍');
    else {
      const date = await getDate(message.channel);
      if (!date || !date.isValid()) return message.react('❓');
      // add entry
      await addUser(message.author.id, date.format('YYYY-MM-DD'), false, client.user.id);
      await message.react('✅');
    }
  }
};

module.exports.data = {
  name: 'postReaction',
};
