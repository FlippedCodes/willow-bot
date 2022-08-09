const moment = require('moment');

const userDoB = require('../../../database/models/UserDoB');

// creates a embed messagetemplate for failed actions
function messageFail(message, body) {
  client.functions.get('ENGINE_message_embed')
    .run(message.channel, body, '', 16449540, false)
    .then((msg) => msg.delete({ timeout: 10000 }));
}

async function searchUser(ID) {
  const result = await userDoB.findOne({ where: { ID } }).catch(ERR);
  return result;
}

function sendMessage(EmbedBuilder, channel, userTag, userID, age, DoB, allow, teammemberTag, updated, created) {
  let color = 16741376;
  if (allow) color = 4296754;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${userTag}`)
    .addFields([
      { name: 'ID', value: userID, inline: true },
      { name: 'Age', value: String(age), inline: true },
      { name: 'DoB', value: DoB, inline: true },
      { name: 'Allow', value: prettyCheck(allow), inline: true },
      { name: 'Created by', value: teammemberTag, inline: true },
      { name: 'Created at', value: created, inline: false },
      { name: 'Updated at', value: updated, inline: false },
    ]);

  // send message
  channel.send({ embeds: [embed] });
}

module.exports.run = async (message, EmbedBuilder, userID) => {
  // search entry
  const DBentry = await searchUser(userID);
  // report to user if entry added
  if (!DBentry) return messageFail(message, `No data found for the ID \`${userID}\`!`);
  // get DoB
  const DoB = DBentry.DoB;
  // get age
  const age = moment().diff(DoB, 'years');
  // get user tags and format dates
  const [userTag, teammemberTag] = [userID, DBentry.teammemberID].map((uID) => client.users.cache.find(({ id }) => id === uID).tag);
  const [updatedAt, createdAt] = [DBentry.updatedAt, DBentry.createdAt].map((date) => moment(date).format('ddd, MMM Do YYYY, h:mm a'));
  const formatDoB = moment(DoB).format('YYYY-MM-DD');
  // send it
  sendMessage(EmbedBuilder, message.channel, userTag, userID, age, formatDoB, DBentry.allow, teammemberTag, updatedAt, createdAt);
};

module.exports.data = {
  name: 'search',
};
