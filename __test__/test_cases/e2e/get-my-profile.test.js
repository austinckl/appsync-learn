const given = require('../../steps/given');
const when = require('../../steps/when');

describe('Get my profile e2e testing', () => {
  let user, auth;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    user = await when.user_signup(name, email, password);
    auth = await when.user_login(email, password);
  });

  it('Fetch user profile with getMyProfile', async () => {
    const profile = await when.user_call_getMyProfile(auth);

    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: null,
      location: null,
      website: null,
      birthdate: null,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      // tweets,
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    });

    const [firstName, lastName] = user.name.split(' ');
    expect(profile.screenName).toContain(firstName);
    expect(profile.screenName).toContain(lastName);
  });
});
