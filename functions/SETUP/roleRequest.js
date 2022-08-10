/* eslint-disable no-restricted-syntax */
const { EmbedBuilder } = require('discord.js');

async function buildEmbed(roleData) {
  const embed = new EmbedBuilder();
  await roleData.forEach(async (reaction) => {
    await embed.addFields([{ name: reaction.name, value: reaction.emoji, inline: true }]);
  });
  const result = embed
    .setTitle('Rolerequest')
    .setDescription('Click on the reactions to get the roles!\nPlease read <#1006243124760293376> for a more details about the roles!');
  return result;
}

async function postReactions(message, roleData) {
  await roleData.forEach(async (reaction) => {
    await message.react(await reaction.emoji);
  });
}

module.exports.run = async () => {
  const roleRequestID = config.setup.roleRequest.channelID;
  const roleRequest = await client.channels.fetch(roleRequestID);
  if (!roleRequest) {
    console.log(`[${module.exports.data.name}] The channel with the ID ${roleRequestID} doesn't exist and is going to be skipped!`);
    return;
  }
  await roleRequest.bulkDelete(10).catch(ERR);
  const roleData = config.setup.roleRequest.roles;
  const embed = await buildEmbed(roleData);
  const sentMessage = await roleRequest.send({ embeds: [embed] });
  postReactions(sentMessage, roleData);
};

module.exports.data = {
  name: 'roleRequest',
};
