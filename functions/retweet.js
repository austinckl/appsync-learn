const ulid = require('ulid');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const { TweetTypes } = require('../lib/constants');

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE, RETWEETS_TABLE } =
  process.env;

module.exports.handler = async (event) => {
  const { tweetId } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const tweetResp = await DocumentClient.get({
    TableName: TWEETS_TABLE,
    Key: {
      id: tweetId,
    },
  }).promise();

  const tweet = tweetResp.Item;
  if (!!tweet) {
    throw new Error('Tweet is not found');
  }

  const newTweet = {
    id,
    __typename: TweetTypes.RETWEET,
    creator: username,
    createdAt: timestamp,
    retweetOf: tweetId,
  };

  const transactItems = [
    {
      Put: {
        TableName: TWEETS_TABLE,
        Item: newTweet,
      },
    },
    {
      Put: {
        TableName: RETWEETS_TABLE,
        Item: {
          userId: username,
          tweetId,
          createdAt: timestamp,
        },
        ConditionExpression: 'attribute_not_exists(tweetId)',
      },
    },
    {
      Update: {
        TableName: TWEETS_TABLE,
        Key: {
          id: tweetId,
        },
        UpdateExpression: 'ADD retweets :one',
        ExpressionAttributeValues: {
          ':one': 1,
        },
        ConditionExpression: 'attribute_exists(id)',
      },
    },
    {
      Update: {
        TableName: USERS_TABLE,
        Key: {
          id: username,
        },
        UpdateExpression: 'ADD tweetsCount :one',
        ExpressionAttributeValues: {
          ':one': 1,
        },
        ConditionExpression: 'attribute_exists(id)',
      },
    },
  ];

  if (tweet.creator !== username) {
    transactItems.push({
      Put: {
        TableName: TIMELINES_TABLE,
        Item: {
          userId: username,
          tweetId: id,
          retweetOf: tweetId,
          timestamp,
        },
      },
    });
  }

  await DocumentClient.transactWrite({
    TransactItems: transactItems,
  }).promise();

  return true;
};
