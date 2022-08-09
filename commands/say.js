module.exports.run = async (interaction) => {
  // only guild command
  if (!await interaction.inGuild()) return messageFail(interaction, 'This comamnd is for servers only.');
  // check if user is owner
  if (!interaction.member.roles.cache.find(({ id }) => id === config.ownerRole)) return messageFail(interaction, 'You don\'t have access to this command! òwó');
  // send message
  const output = await interaction.channel.send(interaction.options.getString('message', true)).catch(ERR);
  // send log and user confirmation
  if (output) messageSuccess(interaction, 'Messages sent!', null, true);
  else messageFail(interaction, 'Something went wrong... Do I have permissions to send in here?');
};

module.exports.data = new CmdBuilder()
  .setName('say')
  .setDescription('I\'ll speak your message!')
  .addStringOption((option) => option.setName('message').setDescription('Tell me what to say.').setRequired(true));
