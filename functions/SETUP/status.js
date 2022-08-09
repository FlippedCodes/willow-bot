module.exports.run = async () => {
  // FIXME: Status doesnt get set
  if (DEBUG) return;
  console.log(`[${module.exports.data.name}] Setting status...`);
  await client.user.setStatus('online');
  const membercount = await client.guilds.cache.reduce((previousCount, currentGuild) => previousCount + currentGuild.memberCount, 0);
  await client.user.setActivity(`${membercount} members in Fazclaire Nightclub`, { type: 'WATCHING' });
  console.log(`[${module.exports.data.name}] Status set!`);
};

module.exports.data = {
  name: 'status',
  callOn: 'setup',
};
