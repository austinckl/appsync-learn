const chance = require('chance').Chance();

const random_user = () => {
  const firstName = chance.first({ nationality: 'en' });
  const lastName = chance.first({ nationality: 'en' });
  const suffix = chance.string({
    length: 4,
    pool: 'abcdefghijklmnopqrstuvwxyz',
  });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = chance.string({ length: 8 });
  const email = chance.email();

  return {
    name,
    password,
    email,
  };
};

module.exports = {
  random_user,
};
