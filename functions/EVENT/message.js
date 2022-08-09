module.exports.run = async (message) => {
  // return if unwanted
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  // checking if staffmember
  // TODO: foreach, with more roles
  // const staff = message.member.roles.cache.has(config.teamRole);

  // non command function: checkin complete questioning Reaction adding
  client.functions.get('ENGINE_checkin_postReaction').run(message);
};

module.exports.data = {
  name: 'message',
};
