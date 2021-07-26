const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const chance = require('chance').Chance();

describe('Retweet integration testing', () => {
  let userA, tweetA;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    userA = await when.user_signup(name, email, password);

    const randomText = chance.sentence({ words: 5 });
    tweetA = await when.invoke_tweet(userA.username, randomText);
  });

  describe('When user retweet own tweet', () => {
    let retweetA;
    beforeAll(async () => {
      await when.invoke_retweet(userA.username, tweetA.id);
    });

    it('Retweet saved in tweets table', async () => {
      retweetA = await then.retweet_exists_in_TweetsTable(
        userA.username,
        tweetA.id
      );
    });

    it('Retweet saved in retweets table', async () => {
      await then.retweet_exists_in_RetweetsTable(userA.username, tweetA.id);
    });

    // 1 for tweet and 1 for retweet
    it('tweetsCount in users table increment to 2', async () => {
      await then.tweetsCount_is_updated_in_UsersTable(userA.username, 2);
    });

    it('Retweets count of original tweet in tweets table increment to 1', async () => {
      await then.retweetsCount_is_updated_in_TweetsTable(tweetA.id, 1);
    });

    it("Retweet doesn't save in timelines table", async () => {
      await then.tweet_not_exists_in_TimelinesTable(
        userA.username,
        retweetA.id
      );
    });
  });

  describe("When user retweet other user's tweet", () => {
    let userB, tweetB, retweetB;
    beforeAll(async () => {
      const { name, email, password } = given.random_user();
      userB = await when.user_signup(name, email, password);

      const randomText = chance.sentence({ words: 5 });
      tweetB = await when.invoke_tweet(userB.username, randomText);

      await when.invoke_retweet(userA.username, tweetB.id);
    });

    it('Retweet saved in tweets table', async () => {
      retweetB = await then.retweet_exists_in_TweetsTable(
        userA.username,
        tweetB.id
      );
    });

    it('Retweet saved in retweets table', async () => {
      await then.retweet_exists_in_RetweetsTable(userA.username, tweetB.id);
    });

    // 1 for tweet, 1 for retweet self tweet and 1 for retweet other tweet
    it('tweetsCount in users table increment to 2', async () => {
      await then.tweetsCount_is_updated_in_UsersTable(userA.username, 3);
    });

    it('Retweets count of original tweet in tweets table increment to 1', async () => {
      await then.retweetsCount_is_updated_in_TweetsTable(tweetB.id, 1);
    });

    it('Retweet saved in timelines table', async () => {
      const tweetInTimeline = await then.tweet_exists_in_TimelinesTable(
        userA.username,
        retweetB.id
      );

      expect(tweetInTimeline.retweetOf).toBe(tweetB.id);
    });
  });
});
