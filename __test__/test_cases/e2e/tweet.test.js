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

    it('Should able to getTweets', async () => {
      const { tweets, nextToken } = await when.user_call_getTweets(
        auth,
        user.username,
        25
      );

      expect(nextToken).toBeNull();
      expect(tweets.length).toEqual(1);
      expect(tweets[0]).toEqual(tweet);
    });

    it('Should throw exceed 25 tweet per page limit error', async () => {
      await expect(
        when.user_call_getTweets(auth, user.username, 26)
      ).rejects.toMatchObject({
        message: expect.stringMatching('max limit is 25'),
      });
    });
  });
});