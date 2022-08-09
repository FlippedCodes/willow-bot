// init Discord
const {
  Client, IntentsBitField, Partials, Collection,
} = require('discord.js');
// init file system
const fs = require('fs');
// init command builder
const { SlashCommandBuilder } = require('@discordjs/builders');
// use contructor to create intent bit field
const intents = new IntentsBitField(
  IntentsBitField.Flags.DirectMessages,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMessageReactions,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.MessageContent,
);
const partials = [Partials.MESSAGE, Partials.REACTION];
// setting essential global values
// init Discord client
global.client = new Client({ disableEveryone: true, intents, partials });
// init config
global.config = require('./config.json');

global.DEBUG = process.env.NODE_ENV === 'development';

// global.main = {};
global.CmdBuilder = SlashCommandBuilder;

global.ERR = (err) => {
  console.error('ERROR:', err);
  if (DEBUG) return;
  const { EmbedBuilder } = require('discord.js');
  const embed = new EmbedBuilder()
    .setAuthor(`Error: '${err.message}'`)
    .setDescription(`STACKTRACE:\n\`\`\`${err.stack.slice(0, 4000)}\`\`\``)
    .setColor(16449540);
  client.channels.cache.get(config.setup.logStatusChannel).send({ embeds: [embed] });
  return;
};

// creating collections
client.commands = new Collection();
client.functions = new Collection();

// anouncing debug mode
if (DEBUG) console.log(`[${config.name}] Bot is on Debug-Mode. Some functions are not going to be loaded.`);

// Login the bot
client.login(process.env.DCtoken)
  .then(() => {
    // import Functions and Commands; startup database connection
    fs.readdirSync('./functions/STARTUP').forEach((FCN) => {
      if (FCN.search('.js') === -1) return;
      const INIT = require(`./functions/STARTUP/${FCN}`);
      INIT.run(fs);
    });
  });

client.on('ready', async () => {
  // confirm user logged in
  console.log(`[${config.name}] Logged in as "${client.user.tag}"!`);

  // setup tables
  console.log('[DB] Syncing tables...');
  await sequelize.sync();
  await console.log('[DB] Done syncing!');

  // set bot user status
  // const setupFunctions = client.functions.filter((fcn) => fcn.data.callOn === 'setup');
  // setupFunctions.forEach((FCN) => FCN.run());

  // run setup functions
  config.setup.setupFunctions.forEach((FCN) => {
    client.functions.get(FCN).run();
  });
});

client.on('interactionCreate', async (interaction) => {
  // command handler
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) return command.run(interaction).catch(console.log);
  }
});

client.on('messageCreate', (message) => {
  client.functions.get('EVENT_message').run(message).catch(ERR);
});

client.on('guildMemberRemove', (member) => {
  client.functions.get('EVENT_guildMemberRemove').run(member).catch(ERR);
});

client.on('messageReactionAdd', (reaction, user) => {
  client.functions.get('EVENT_messageReactionAdd').run(reaction, user).catch(ERR);
});

// trigger on reaction with raw package
// client.on('raw', async (packet) => {
//   if (packet.t === 'MESSAGE_REACTION_ADD' && packet.d.guild_id) {
//     client.functions.get('d').run(packet.d);
//   }
// });

// logging errors and warns
client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
process.on('uncaughtException', (ERR));
