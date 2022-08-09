const moment = require('moment');

const userDoB = require('../database/models/UserDoB');

module.exports.run = async (ID) => {
  const dbUser = await userDoB.findOne({ where: { ID } }).catch(ERR);
  // failback, if no entry exists
  if (!dbUser) {
    return {
      allow: null, age: null, DoB: null, teammemberID: null,
    };
  }
  const DoB = dbUser.DoB;
  const age = moment().diff(DoB, 'years');
  const allow = dbUser.allow;
  const teammemberID = dbUser.teammemberID;
  return {
    allow, age, DoB, teammemberID,
  };
};

module.exports.help = {
  name: 'checkUserAge',
};
