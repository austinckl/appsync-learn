require('dotenv').config();
const given = require('../../steps/given');
const when = require('../../steps/when');
const chance = require('chance').Chance();

describe('Get signed image upload url unit testing', () => {
  it.each([
    ['png', 'image/png'],
    ['.png', 'image/png'],
    ['jpeg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    [null, null],
  ])(
    'Should return a signed S3 url with extension %s, and contentType %s',
    async (extension, contentType) => {
      const username = chance.guid();
      const signedUrl = await when.invoke_getImageUplaodUrl(
        username,
        extension,
        contentType
      );

      /** Signed URL format
       *  https://{BUCKET_NAME}.s3-accelerate.amazonaws.com/{OBJECT_KEY}
       */
      const expectedExtension = extension || '';
      const expectedContentType = contentType
        ? contentType.replace('/', '%2F')
        : 'image%2Fjpeg';
      const regex = new RegExp(
        `https://${process.env.BUCKET_NAME}.s3-accelerate.amazonaws.com/${username}/.*${expectedExtension}?.*Content-Type=${expectedContentType}.*`
      );
      expect(signedUrl).toMatch(regex);
    }
  );
});
