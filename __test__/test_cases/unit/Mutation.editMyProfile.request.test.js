const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();
const path = require('path');

describe('Mutation.editMyProfile.request template', () => {
  it('Should use newProfile fields in expression values', () => {
    const templatePath = path.resolve(
      __dirname,
      '../../../mapping-templates/Mutation.editMyProfile.request.vtl'
    );
    const username = chance.guid();
    const randomName = chance.name();
    const randomSentence = chance.sentence({ words: 5 });
    const randomDomain = chance.domain();
    const newProfile = {
      name: randomName,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: randomSentence,
      location: null,
      website: randomDomain,
      birthdate: null,
    };
    const context = given.an_appsync_context({ username }, { newProfile });
    const result = when.invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
      version: '2018-05-29',
      operation: 'UpdateItem',
      key: {
        id: {
          S: username,
        },
      },
      update: {
        expression:
          'set #name = :name, imageUrl = :imageUrl, backgroundImageUrl = :backgroundImageUrl, bio = :bio, #location = :location, website = :website, birthdate = :birthdate',
        expressionNames: {
          '#name': 'name',
          '#location': 'location',
        },
        expressionValues: {
          ':name': {
            S: randomName,
          },
          ':imageUrl': {
            NULL: true,
          },
          ':backgroundImageUrl': {
            NULL: true,
          },
          ':bio': {
            S: randomSentence,
          },
          ':location': {
            NULL: true,
          },
          ':website': {
            S: randomDomain,
          },
          ':birthdate': {
            NULL: true,
          },
        },
      },
      condition: {
        expression: 'attribute_exists(id)',
      },
    });
  });
});
