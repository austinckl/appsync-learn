const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('Tweet integration testing', () => {
  let user;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    user = await when.user_signup(name, email, password);
  });

  describe('When invoke tweet function', () => {
    let tweet;
    const randomText = chance.sentence({ words: 5 });
    beforeAll(async () => {
      tweet = await when.invoke_tweet(user.username, randomText);
    });

    it('Tweet saved in tweets table', async () => {
      await then.tweet_exists_in_TweetsTable(tweet.id);
    });

    it('Tweet saved in timelines table', async () => {
      await then.tweet_exists_in_TimelinesTable(user.username, tweet.id);
    });

    it('tweetsCount in users table increment to 1', async () => {
      await then.tweetsCount_is_updated_in_UsersTable(user.username, 1);
    });

    // Given authenticated user

    // When invoke tweet

    // Then tweet exist in tweet table
    // Then tweet exist in timeline table
    // Then user tweetCount increment in user table
  });
});
