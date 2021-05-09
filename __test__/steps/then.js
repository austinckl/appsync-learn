require('dotenv').config();
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const user_exists_in_UsersTable = async (id) => {
  console.log(`looking for usre [${id}] in table [${process.env.USERS_TABLE}]`);

  const resposne = await DocumentClient.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id,
    },
  }).promise();

  expect(resposne.Item).toBeTruthy();

  return resposne.Item;
};

module.exports = {
  user_exists_in_UsersTable,
};
