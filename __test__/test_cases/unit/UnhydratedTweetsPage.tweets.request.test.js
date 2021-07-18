const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();
const path = require('path');

describe('UnhydratedTweetsPage.tweets.request template', () => {
  it('Should return empty array when source.tweets is empty', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/UnhydratedTweetsPage.tweets.request.vtl'
    );
    const username = chance.guid();
    const context = given.an_appsync_context(
      { username },
      {},
      {},
      { tweets: [] }
    );
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual([]);
  });

  it('Should convert timeline tweets', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/UnhydratedTweetsPage.tweets.request.vtl'
    );
    const username = chance.guid();
    const tweetId = chance.guid();
    const tweets = [{ userId: username, tweetId }];
    const context = given.an_appsync_context({ username }, {}, {}, { tweets });
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      version: '2018-05-29',
      operation: 'BatchGetItem',
      tables: {
        '${TweetsTable}': {
          keys: [
            {
              id: {
                S: tweetId,
              },
            },
          ],
          consistentRead: false,
        },
      },
    });
  });
});