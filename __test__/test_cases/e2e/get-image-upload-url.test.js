require('dotenv').config();
const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');
const path = require('path');

describe('Get signed image upload url e2e testing', () => {
  let user, auth;
  beforeAll(async () => {
    const { name, email, password } = given.random_user();
    user = await when.user_signup(name, email, password);
    auth = await when.user_login(email, password);
  });

  it('Should get signed url > upload image > download image', async () => {
    const signedUrl = await when.user_call_getImageUploadUrl(
      auth,
      '.png',
      'image/png'
    );

    /** Signed URL format
     *  https://{BUCKET_NAME}.s3-accelerate.amazonaws.com/{OBJECT_KEY}
     */
    const expectedExtension = '.png';
    const expectedContentType = 'image%2Fpng';
    const regex = new RegExp(
      `https://${process.env.BUCKET_NAME}.s3-accelerate.amazonaws.com/${user.username}/.*${expectedExtension}?.*Content-Type=${expectedContentType}.*`
    );
    expect(signedUrl).toMatch(regex);

    const filePath = path.join(__dirname, '../../data/demo.png');
    const contentType = 'image/png';
    await then.user_can_upload_image_to_url(signedUrl, filePath, contentType);

    const downloadUrl = signedUrl.split('?')[0]; // Remove query parameter
    await then.user_can_download_image_from_url(downloadUrl);
  });
});
