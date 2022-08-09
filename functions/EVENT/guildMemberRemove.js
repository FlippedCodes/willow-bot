module.exports.run = async (member) => {
  // check if user had roles | 1 beacuse @everyone is also a counted role
  if (member.roles.cache.size !== 1) return;
  // get checkin channel
  const checkinChannel = await member.guild.channels.cache.find((channel) => channel.name === member.id);
  // delete checkin channel if existent
  if (checkinChannel) {
    await client.functions.get('ENGINE_checkin_transcriptChannel').run(checkinChannel);
    checkinChannel.delete();
  }
};

module.exports.data = {
  name: 'guildMemberRemove',
};
