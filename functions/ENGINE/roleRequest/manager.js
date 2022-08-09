const { EmbedBuilder } = require('discord.js');

function sendEmbed(channel, color, text, title) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(text);
  channel.send({ embeds: [embed] });
}

// creates a embed messagetemplate for succeded actions
function messageSuccess(channel, message, title) {
  sendEmbed(channel, 'Green', message, title);
}

// creates a embed messagetemplate for failed actions
function messageFail(channel, message, title) {
  sendEmbed(channel, 'Red', message, title);
}

// prepare output message and send it
function outputSuccessMessage(userName, message, nowAssigned, wasAssigned) {
  let body;
  // check case
  if (nowAssigned) body = `Assigned \`${nowAssigned}\` to you. Have fun!`;
  if (wasAssigned) body = `I removed \`${wasAssigned}\` from you.`;
  if (wasAssigned && nowAssigned) body = `I removed \`${wasAssigned}\` and assigned \`${nowAssigned}\` to you. Have fun!`;
  messageSuccess(message.channel, body, userName);
}

async function checkUserAge(client, nsfw, ID) {
  if (nsfw) {
    const user = await client.functions.get('checkUserAge').run(ID);
    return user.allow;
  }
  return true;
}

async function getRoles(user, reaction) {
  const guild = reaction.message.guild;
  const roles = await guild.members.cache.find(({ id }) => id === user.id).roles;
  return roles;
}

// check if role is unique and return what role needs to be removed
function checkUniqueRole(wantsRole, uniqueRoles, userRoles) {
  let roleFound;
  const unique = uniqueRoles.find((roleID) => roleID === wantsRole);
  if (!unique) return roleFound;
  uniqueRoles.forEach((uniqueRole) => {
    const result = userRoles.cache.find(({ id }) => id === uniqueRole);
    if (result) roleFound = result;
  });
  return roleFound;
}

async function roleHandler(requestedRole, checkRoleNames, user, reaction) {
  const wantsRoleID = requestedRole.roleID;
  const wantsRoleName = requestedRole.name;
  // get user roels object to interact with API
  const userRoles = await getRoles(user, reaction);
  const sameRole = userRoles.cache.find(({ id }) => id === wantsRoleID);
  // check if user already has role
  if (sameRole) {
    userRoles.remove(wantsRoleID);
    return outputSuccessMessage(user.tag, reaction.message, null, wantsRoleName);
  }
  // get unique role already assigned
  const alreadyAssignedUnique = checkUniqueRole(wantsRoleID, checkRoleNames, userRoles);
  // check if unique role is assigned and remove it, bevore giving
  if (alreadyAssignedUnique) {
    userRoles.remove(alreadyAssignedUnique);
  }
  // add desiered role
  userRoles.add(wantsRoleID);
  let wasAssigned;
  if (alreadyAssignedUnique) wasAssigned = alreadyAssignedUnique.name;
  return outputSuccessMessage(user.tag, reaction.message, wantsRoleName, wasAssigned);
}

module.exports.run = async (reaction, user) => {
  const roleRequestConf = config.setup.roleRequest;
  if (reaction.message.channel.id !== roleRequestConf.channelID) return;
  // check name with the reaction name
  const requestedRole = roleRequestConf.roles.find((emojiEntry) => emojiEntry.emoji === reaction.emoji.name);
  if (requestedRole) {
    // check user age
    const allowed = await checkUserAge(client, requestedRole.mature, user.id);
    switch (allowed) {
      case true:
        await roleHandler(requestedRole, roleRequestConf.unique, user, reaction);
        break;
      case false:
        messageFail(reaction.message.channel, `\`${requestedRole.name}\` is a 18+ role. You are not old enough, that I can give you this role!`, user.tag);
        break;
      case null:
        messageFail(reaction.message.channel, `\`${requestedRole.name}\` is a 18+ role. You haven't applied for that yet. Have a read of <#1005326600600039484> how to get access.`, user.tag);
        break;
      default:
        break;
    }
  }
  reaction.users.remove(user);
};

module.exports.data = {
  name: 'manager',
};
