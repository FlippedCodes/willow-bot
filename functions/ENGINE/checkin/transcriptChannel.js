const { Collection, EmbedBuilder } = require('discord.js');

const fs = require('fs').promises;

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const dom = new JSDOM();

const document = dom.window.document;

module.exports.run = async (channel) => {
  let messageCollection = new Collection();
  let channelMessages = await channel.messages.fetch({ limit: 100 }).catch((err) => console.log(err));

  messageCollection = messageCollection.concat(channelMessages);

  while (channelMessages.size === 100) {
    const lastMessageId = channelMessages.lastKey();
    // eslint-disable-next-line no-await-in-loop
    channelMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId }).catch((err) => console.log(err));
    if (channelMessages) messageCollection = messageCollection.concat(channelMessages);
  }
  const allMessages = Array.from(messageCollection.values()).reverse();

  const data = await fs.readFile('./assets/transcript/template.html', 'utf8').catch((err) => console.log(err));
  if (!data) return console.error('Template file could not be loaded!');
  // create file
  await fs.writeFile('./cache/index.html', data).catch((err) => console.log(err));
  // add guild title
  const guildElement = document.createElement('div');
  const guildText = document.createTextNode(channel.name);
  const guildImg = document.createElement('img');
  guildImg.setAttribute('src', channel.guild.iconURL());
  guildImg.setAttribute('width', '150');
  guildElement.appendChild(guildImg);
  guildElement.appendChild(guildText);
  await fs.appendFile('./cache/index.html', guildElement.outerHTML).catch((err) => console.log(err));

  // forEach all messages
  allMessages.forEach(async (msg) => {
    const parentContainer = document.createElement('div');
    parentContainer.className = 'parent-container';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const img = document.createElement('img');
    img.setAttribute('src', msg.author.displayAvatarURL());
    img.className = 'avatar';
    avatarDiv.appendChild(img);

    parentContainer.appendChild(avatarDiv);

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    const nameElement = document.createElement('span');
    const name = document.createTextNode(`${msg.author.tag} ${msg.createdAt.toLocaleDateString()} ${msg.createdAt.toLocaleTimeString()}`);
    nameElement.appendChild(name);
    messageContainer.append(nameElement);

    if (msg.content.startsWith('```')) {
      const m = msg.content.replace(/```/g, '');
      const codeNode = document.createElement('code');
      const textNode = document.createTextNode(m);
      codeNode.appendChild(textNode);
      messageContainer.appendChild(codeNode);
    } else {
      const msgNode = document.createElement('span');
      const textNode = document.createTextNode(`\n${msg.content}\n`);
      msgNode.append(textNode);
      messageContainer.appendChild(msgNode);
    }
    parentContainer.appendChild(messageContainer);
    await fs.appendFile('./cache/index.html', parentContainer.outerHTML).catch((err) => console.log(err));
  });
  const archive = channel.guild.channels.cache.get(config.checkin.archiveChannel);
  archive.send({
    embeds: [new EmbedBuilder().setTitle(channel.name)],
    files: [{
      attachment: './cache/index.html',
      name: `${channel.name}.html`,
    }],
  }).catch((err) => console.log(err));
};

module.exports.data = {
  name: 'transcriptChannel',
};
