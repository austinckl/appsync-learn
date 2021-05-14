const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

describe('When user signs up', () => {
  it('User profile should saved in DynamoDB', async () => {
    const { name, email, password } = given.random_user();

    const user = await when.user_signup(name, email, password);

    const ddbUser = await then.user_exists_in_UsersTable(user.username);

    expect(ddbUser).toMatchObject({
      id: user.username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    });

    const [firstName, lastName] = user.name.split(' ');
    expect(ddbUser.screenName).toContain(firstName);
    expect(ddbUser.screenName).toContain(lastName);
  });
});
