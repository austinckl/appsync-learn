const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('Tweet e2e testing', () => {
  let user, auth;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    user = await when.user_signup(name, email, password);
    auth = await when.user_login(email, password);
  });

  describe('When send tweet', () => {
    let tweet;
    const randomText = chance.sentence({ words: 5 });
    beforeAll(async () => {
      tweet = await when.user_call_tweet(auth, randomText);
    });

    it('Should return new tweet', () => {
      expect(tweet).toMatchObject({
        text: randomText,
        replies: 0,
        likes: 0,
        retweets: 0,
      });
    });
  });
});
