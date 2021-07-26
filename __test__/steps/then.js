require('dotenv').config();
const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const user_exists_in_UsersTable = async (id) => {
  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);

  const response = await DocumentClient.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id,
    },
  }).promise();

  expect(response.Item).toBeTruthy();

  return response.Item;
};

const user_can_upload_image_to_url = async (
  uploadUrl,
  filePath,
  contentType
) => {
  const data = fs.readFileSync(filePath);
  await axios({
    method: 'put',
    url: uploadUrl,
    headers: {
      'Content-Type': contentType,
    },
    data,
  });

  return;
};

const user_can_download_image_from_url = async (downlaodUrl) => {
  console.log(`download url - ${downlaodUrl}`);

  const resp = await axios(downlaodUrl);

  return resp.data;
};

const tweet_exists_in_TweetsTable = async (id) => {
  console.log(
    `looking for tweet [${id}] in table [${process.env.TWEETS_TABLE}]`
  );

  const response = await DocumentClient.get({
    TableName: process.env.TWEETS_TABLE,
    Key: {
      id,
    },
  }).promise();

  expect(response.Item).toBeTruthy();

  return response.Item;
};

const retweet_exists_in_TweetsTable = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] in table [${process.env.TWEETS_TABLE}]`
  );

  const response = await DocumentClient.query({
    TableName: process.env.TWEETS_TABLE,
    IndexName: 'retweetByCreator',
    KeyConditionExpression: 'creator = :userId AND retweetOf = :tweetId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':tweetId': tweetId,
    },
    Limit: 1,
  }).promise();

  const retweet = _.get(response, 'Items.0');

  expect(retweet).toBeTruthy();

  return retweet;
};

const tweet_exists_in_TimelinesTable = async (userId, tweetId) => {
  console.log(
    `looking for tweet [${tweetId}] for user [${userId}] in table [${process.env.TIMELINES_TABLE}]`
  );

  const response = await DocumentClient.get({
    TableName: process.env.TIMELINES_TABLE,
    Key: {
      userId,
      tweetId,
    },
  }).promise();

  expect(response.Item).toBeTruthy();

  return response.Item;
};

const retweet_exists_in_RetweetsTable = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] for user [${userId}] in table [${process.env.RETWEETS_TABLE}]`
  );

  const response = await DocumentClient.get({
    TableName: process.env.RETWEETS_TABLE,
    Key: {
      userId,
      tweetId,
    },
  }).promise();

  expect(response.Item).toBeTruthy();

  return response.Item;
};

const tweetsCount_is_updated_in_UsersTable = async (userId, tweetsCount) => {
  const response = await DocumentClient.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id: userId,
    },
  }).promise();

  expect(response.Item).toBeTruthy();
  expect(response.Item.tweetsCount).toEqual(tweetsCount);

  return;
};

const retweetsCount_is_updated_in_TweetsTable = async (tweetId, count) => {
  const response = await DocumentClient.get({
    TableName: process.env.TWEETS_TABLE,
    Key: {
      id: tweetId,
    },
  }).promise();

  expect(response.Item).toBeTruthy();
  expect(response.Item.retweets).toEqual(count);

  return;
};

module.exports = {
  user_exists_in_UsersTable,
  user_can_upload_image_to_url,
  user_can_download_image_from_url,
  tweet_exists_in_TweetsTable,
  retweet_exists_in_TweetsTable,
  tweet_exists_in_TimelinesTable,
  retweet_exists_in_RetweetsTable,
  tweetsCount_is_updated_in_UsersTable,
  retweetsCount_is_updated_in_TweetsTable,
};
