const ulid = require('ulid');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const { TweetTypes } = require('../lib/constants');

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { text } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const newTweet = {
    id,
    text,
    __typename: TweetTypes.TWEET,
    creator: username,
    createdAt: timestamp,
    replies: 0,
    likes: 0,
    retweets: 0,
  };

  await DocumentClient.transactWrite({
    TransactItems: [
      {
        Put: {
          TableName: TWEETS_TABLE,
          Item: newTweet,
        },
      },
      {
        Put: {
          TableName: TIMELINES_TABLE,
          Item: {
            userId: username,
            tweetId: id,
            timestamp,
          },
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
    ],
  }).promise();

  return newTweet;
};
