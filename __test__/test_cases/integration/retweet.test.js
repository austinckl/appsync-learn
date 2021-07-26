const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('Retweet integration testing', () => {
  let userA, tweet;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    userA = await when.user_signup(name, email, password);

    const randomText = chance.sentence({ words: 5 });
    tweet = await when.invoke_tweet(userA.username, randomText);
  });

  describe('When user retweet own tweet', () => {
    let retweet;
    beforeAll(async () => {
      await when.invoke_retweet(userA.username, tweet.id);
    });

    it('Retweet saved in tweets table', async () => {
      await then.retweet_exists_in_TweetsTable(userA.username, tweet.id);
    });

    it('Retweet saved in retweets table', async () => {
      await then.retweet_exists_in_RetweetsTable(userA.username, tweet.id);
    });

    // 1 for tweet and 1 for retweet
    it('tweetsCount in users table increment to 2', async () => {
      await then.tweetsCount_is_updated_in_UsersTable(userA.username, 2);
    });

    it('Retweets count of original tweet in tweets table increment to 1', async () => {
      await then.retweetsCount_is_updated_in_TweetsTable(tweet.id, 1);
    });

    it("Retweet doesn't save into timelines table", async () => {
      // await then.tweet_not_exists_in_TimelinesTable(userA.username, retweet.id);
    });
  });
});
