const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();
const path = require('path');

describe('Tweet.profile.request template', () => {
  it('Should not short-circuit when selectionSetList more than just id', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Tweet.profile.request.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      {},
      {},
      { creator: username },
      { selectionSetList: ['id', 'bio'] }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      version: '2018-05-29',
      operation: 'GetItem',
      key: {
        id: {
          S: username,
        },
      },
    });
  });

  it('Should short-circuit when selectionSetList has only id', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Tweet.profile.request.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      {},
      {},
      { creator: username },
      { selectionSetList: ['id'] }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      id: username,
      __typename: 'MyProfile',
    });
  });
});
