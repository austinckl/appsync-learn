const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();

describe('Edit my profile e2e testing', () => {
  let user, auth, profile;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    user = await when.user_signup(name, email, password);
    auth = await when.user_login(email, password);
    profile = await when.user_call_getMyProfile(auth);
  });

  it('Fetch user profile with getMyProfile', async () => {
    const randomName = chance.name();
    const input = { name: randomName };
    const updatedProfile = await when.user_call_editMyProfile(auth, input);

    expect(updatedProfile).toMatchObject({
      ...profile,
      name: randomName,
    });
  });
});
