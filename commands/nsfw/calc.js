function checkAllowed(moment, DoB) {
  const age = moment().diff(DoB, 'years');
  return [age >= 18, age];
}

function calcMonths(moment, DoB) {
  // needs to be parsed to moment, otherwise it changed overall
  const fullAgeBD = moment(DoB).add(18, 'years');
  const monthDiff = moment(fullAgeBD).diff(moment(), 'months');
  return monthDiff;
}

module.exports.run = async (interaction, moment) => {
  const command = interaction.options;
  // get DoB date
  const date = moment(command.getString('date', true), config.DoBchecking.dateFormats, false);
  // validate date
  if (!date.isValid()) return messageFail(interaction, 'Your provided DoB is not a date!');
  // get allow
  const [allow, age] = checkAllowed(moment, date);
  // report to user if entry added
  let color = 16741376;
  let months = '-';
  if (allow) color = 4296754;
  else months = await calcMonths(moment, date);
  messageSuccess(interaction, `
  Age: \`${age}\`
  Months till 18th Bday: \`${months}\`
  Allow: ${prettyCheck(allow)}
  parsedDoB: \`${date.format(config.DoBchecking.dateFormats[0])}\``, color);
};

module.exports.data = { subcommand: true };
