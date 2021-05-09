const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('When confirmUserSignup runs', () => {
  it('User profile should saved in DynamoDB', async () => {
    const { name, email } = given.random_user();
    const username = chance.guid();

    await when.invoke_confirmUserSignup(username, name, email);

    const user = await then.user_exists_in_UsersTable(username);

    expect(user).toMatchObject({
      id: username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    });

    const [firstName, lastName] = name.split(' ');
    expect(user.screenName).toContain(firstName);
    expect(user.screenName).toContain(lastName);
  });
});
