require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
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

module.exports = {
  user_exists_in_UsersTable,
  user_can_upload_image_to_url,
  user_can_download_image_from_url,
};
