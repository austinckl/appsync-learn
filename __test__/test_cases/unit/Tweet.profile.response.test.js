const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();
const path = require('path');

describe('Tweet.profile.response template', () => {
  it("__typename = 'MyProfile' when userId = authenticated user", () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Tweet.profile.response.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      {},
      { id: username }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      id: username,
      __typename: 'MyProfile',
    });
  });

  it("__typename = 'OtherProfile' when userId != authenticated user", () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Tweet.profile.response.vtl'
    );
    const username = chance.guid();
    const otherUserId = chance.guid();
    const context = given.an_appsync_context(
      { username },
      {},
      { id: otherUserId }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      id: otherUserId,
      __typename: 'OtherProfile',
    });
  });
});
