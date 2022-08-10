const { EmbedBuilder } = require('discord.js');

const fs = require('fs');

module.exports.run = async (interaction) => {
  fs.readFile(config.aboutText, 'utf8', (err, content) => {
    if (err) {
      console.log(err);
      messageFail(interaction, 'Oh, no! Something went wrong. Sorry about that :(');
      return;
    }
    const embed = new EmbedBuilder();
    embed.setDescription(content)
      .setColor('Orange')
      .setTitle('About');
    reply(interaction, { embeds: [embed] });
    // messageSuccess(interaction, content, 'ORANGE', true);
  });
};

module.exports.data = new CmdBuilder()
  .setName('about')
  .setDescription('Learn more about me!');
