const { EmbedBuilder } = require('discord.js');

module.exports.run = async (channel, body, title, color, footer) => {
  // needs to be local as settings overlap from dofferent embed-requests
  const embed = new EmbedBuilder();

  if (body) embed.setDescription(body);
  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  if (footer) embed.setFooter(footer);

  return channel.send({ embeds: [embed] });
};

module.exports.data = {
  name: 'embed',
};
