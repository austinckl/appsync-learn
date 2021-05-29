const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();
const path = require('path');

describe('Query.getTweets.request template', () => {
  it('Should throw max limit is 25 error', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Query.getTweets.request.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      { userId: username, limit: 26 }
    );
    expect(() =>
      when.invoke_an_appsync_template(templatePath, context)
    ).toThrowError('max limit is 25');
  });

  it('Should use userId in expression value', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Query.getTweets.request.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      { userId: username, limit: 25, nextToken: 'random-token' }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      version: '2018-05-29',
      operation: 'Query',
      query: {
        expression: 'creator = :userId',
        expressionValues: {
          ':userId': {
            S: username,
          },
        },
      },
      index: 'byCreator',
      nextToken: 'random-token',
      limit: 25,
      scanIndexForward: false,
      consistentRead: false,
      select: 'ALL_ATTRIBUTES',
    });
  });
});
