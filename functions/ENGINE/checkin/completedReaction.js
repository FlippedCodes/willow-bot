const { EmbedBuilder } = require('discord.js');

// creates a embed messagetemplate for succeded actions
function messageSuccess(channel, body) {
  client.functions.get('ENGINE_message_embed')
    .run(channel, body, '', 4296754, false);
}

// creates a embed messagetemplate for failed actions
async function messageFail(channel, body) {
  const result = client.functions.get('ENGINE_message_embed')
    .run(channel, body, '', 16449540, false);
  return result;
}

module.exports.run = async (reaction, user) => {
  const member = await reaction.message.guild.members.fetch(user);
  if (!member.roles.cache.has(config.teamRole)) {
    reaction.users.remove(user);
    const failMessage = await messageFail(reaction.message.channel, 'The reactions are not meant for you.\nPlease wait for a Teammember to check you in.');
    setTimeout(() => failMessage.delete(), 10000);
    return;
  }
  switch (reaction.emoji.name) {
    case '👌':
      // add role
      config.checkin.checkinRoles.forEach((role) => reaction.message.member.roles.add(role));
      // post welcome message
      const welcomeChannel = member.guild.channels.cache.get(config.checkin.welcomeChannel);
      welcomeChannel.send(`Congratulations ${reaction.message.author} on the verification! You get to see boobs! There's nothing much else to say here, other than you can look in <#1006243124760293376> for some roles you can assign yourself. Other than that, enjoy yourself!`);
      await client.functions.get('ENGINE_checkin_transcriptChannel').run(reaction.message.channel);
      // delete channel
      await reaction.message.channel.delete();
      return;

    case '✋':
      // dm user
      messageFail(reaction.message.author, 'It seems like your check-in got declined or you exceed your stay with not replying back.');
      await client.functions.get('ENGINE_checkin_transcriptChannel').run(reaction.message.channel);
      // delete channel
      await reaction.message.channel.delete();
      return;

    case '🔍':
      client.functions.get('ENGINE_nsfw_search').run(reaction.message, EmbedBuilder, reaction.message.author.id);
      return;

    case '❓':
      messageFail(reaction.message.channel, 'Was unable to parse DoB to create entry.');
      return;

    case '✅':
      messageSuccess(reaction.message.channel, 'DoB parsed successfully and nsfw entry got created');
      client.functions.get('ENGINE_nsfw_search').run(reaction.message, EmbedBuilder, reaction.message.author.id);
      return;

    default:
      return;
  }
};

module.exports.data = {
  name: 'completedReaction',
};
