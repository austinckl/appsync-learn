require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper');
const velocityTemplate = require('amplify-velocity-template');
const { GraphQL, registerFragment } = require('../lib/graphql');

const myProfileFragment = `
fragment myProfileFields on MyProfile {
  id
  name
  screenName
  imageUrl
  backgroundImageUrl
  bio
  location
  website
  birthdate
  createdAt
  followersCount
  followingCount
  tweetsCount
  likesCount
}
`;

const otherProfileFragment = `
fragment otherProfileFields on OtherProfile {
  id
  name
  screenName
  imageUrl
  backgroundImageUrl
  bio
  location
  website
  birthdate
  createdAt
  followersCount
  followingCount
  tweetsCount
  likesCount
}
`;

const iProfileFragment = `
fragment iProfileFields on IProfile {
  ... on MyProfile {
    ... myProfileFields
  }

  ... on OtherProfile {
    ... otherProfileFields
  }
}
`;

const tweetFragment = `
fragment tweetFields on Tweet {
  id
  profile {
    ... iProfileFields
  }
  createdAt
  text
  replies
  likes
  retweets
  liked
}
`;

const iTweetFragment = `
fragment iTweetFields on ITweet {
  ... on Tweet {
    ... tweetFields
  }
}
`;

registerFragment('myProfileFields', myProfileFragment);
registerFragment('otherProfileFields', otherProfileFragment);
registerFragment('iProfileFields', iProfileFragment);
registerFragment('tweetFields', tweetFragment);
registerFragment('iTweetFields', iTweetFragment);

const invoke_confirmUserSignup = async (username, name, email) => {
  const handler = require('../../functions/confirm-user-signup').handler;

  const context = {};
  const event = {
    version: '1',
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userName: username,
    triggerSource: 'PostConfirmation_ConfirmSignUp',
    request: {
      userAttributes: {
        sub: username,
        'cognito:email_alias': email,
        'cognito:user_status': 'CONFIRMED',
        email_verified: 'false',
        name: name,
        email: email,
      },
    },
    response: {},
  };

  await handler(event, context);
};

const invoke_getImageUplaodUrl = async (username, extension, contentType) => {
  const handler = require('../../functions/get-image-upload-url').handler;

  const context = {};
  const event = {
    identity: {
      username,
    },
    arguments: {
      extension,
      contentType,
    },
  };

  return await handler(event, context);
};

const invoke_tweet = async (username, text) => {
  const handler = require('../../functions/tweet').handler;

  const context = {};
  const event = {
    identity: {
      username,
    },
    arguments: {
      text,
    },
  };

  return await handler(event, context);
};

const invoke_retweet = async (username, tweetId) => {
  const handler = require('../../functions/retweet').handler;

  const context = {};
  const event = {
    identity: {
      username,
    },
    arguments: {
      tweetId,
    },
  };

  return await handler(event, context);
};

const user_signup = async (name, email, password) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResp = await cognito
    .signUp({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'name', Value: name }],
    })
    .promise();

  const username = signUpResp.UserSub;
  console.log(`[${email}] - user has signed up [${username}]`);

  // Auto verify
  await cognito
    .adminConfirmSignUp({
      UserPoolId: userPoolId,
      Username: username,
    })
    .promise();

  console.log(`[${email}] - confirmed sign up`);

  return {
    username,
    name,
    email,
  };
};

const user_login = async (username, password) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const auth = await cognito
    .initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    })
    .promise();

  console.log(`[${username}] - signed in`);

  return {
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};

const invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  const ast = velocityTemplate.parse(template);
  const compiler = new velocityTemplate.Compile(ast, {
    valueMapper: velocityMapper.map,
    escape: false,
  });

  return JSON.parse(compiler.render(context));
};

const user_call_getMyProfile = async (auth) => {
  const getMyProfile = `query getMyProfile {
    getMyProfile {
      ... myProfileFields

      tweets {
        nextToken
        tweets{
          ... iTweetFields
        }
      }
    }
  }`;

  const data = await GraphQL(
    process.env.API_URL,
    getMyProfile,
    {},
    auth.accessToken
  );
  const profile = data.getMyProfile;

  return profile;
};

const user_call_editMyProfile = async (auth, input) => {
  const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
      ... myProfileFields

      tweets {
        nextToken
        tweets{
          ... iTweetFields
        }
      }
    }
  }`;
  const variables = {
    input,
  };

  const data = await GraphQL(
    process.env.API_URL,
    editMyProfile,
    variables,
    auth.accessToken
  );
  const profile = data.editMyProfile;

  return profile;
};

const user_call_getImageUploadUrl = async (auth, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType) 
  }`;
  const variables = {
    extension,
    contentType,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getImageUploadUrl,
    variables,
    auth.accessToken
  );
  const url = data.getImageUploadUrl;

  return url;
};

const user_call_tweet = async (auth, text) => {
  const tweet = `mutation tweet($text: String!) {
    tweet(text: $text) {
      ... tweetFields
    }
  }`;
  const variables = {
    text,
  };

  const data = await GraphQL(
    process.env.API_URL,
    tweet,
    variables,
    auth.accessToken
  );
  const newTweet = data.tweet;

  return newTweet;
};

const user_call_getTweets = async (auth, userId, limit, nextToken) => {
  const getTweets = `query getTweets($userId: ID!, $limit: Int!, $nextToken: String) {
    getTweets(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets{
        ... iTweetFields
      }
    }
  }`;
  const variables = {
    userId,
    limit,
    nextToken,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getTweets,
    variables,
    auth.accessToken
  );
  const getTweetsResp = data.getTweets;

  return getTweetsResp;
};

const user_call_getMyTimeline = async (auth, limit, nextToken) => {
  const getMyTimeline = `query getMyTimeline($limit: Int!, $nextToken: String) {
    getMyTimeline(limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets{
        ... iTweetFields
      }
    }
  }`;
  const variables = {
    limit,
    nextToken,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getMyTimeline,
    variables,
    auth.accessToken
  );
  const getMyTimelineResp = data.getMyTimeline;

  return getMyTimelineResp;
};

const user_call_getLikes = async (auth, userId, limit, nextToken) => {
  const getLikes = `query getLikes($userId: ID!, $limit: Int!, $nextToken: String) {
    getLikes(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets{
        ... iTweetFields
      }
    }
  }`;
  const variables = {
    userId,
    limit,
    nextToken,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getLikes,
    variables,
    auth.accessToken
  );
  const resp = data.getLikes;

  return resp;
};

const user_call_like = async (auth, tweetId) => {
  const like = `mutation like($tweetId: ID!) {
    like(tweetId: $tweetId)
  }`;
  const variables = {
    tweetId,
  };

  const data = await GraphQL(
    process.env.API_URL,
    like,
    variables,
    auth.accessToken
  );
  const result = data.like;

  return result;
};

const user_call_unlike = async (auth, tweetId) => {
  const unlike = `mutation unlike($tweetId: ID!) {
    unlike(tweetId: $tweetId)
  }`;
  const variables = {
    tweetId,
  };

  const data = await GraphQL(
    process.env.API_URL,
    unlike,
    variables,
    auth.accessToken
  );
  const result = data.unlike;

  return result;
};

module.exports = {
  invoke_confirmUserSignup,
  invoke_getImageUplaodUrl,
  invoke_tweet,
  invoke_retweet,
  user_signup,
  user_login,
  invoke_an_appsync_template,
  user_call_getMyProfile,
  user_call_editMyProfile,
  user_call_getImageUploadUrl,
  user_call_tweet,
  user_call_getTweets,
  user_call_getMyTimeline,
  user_call_getLikes,
  user_call_like,
  user_call_unlike,
};
