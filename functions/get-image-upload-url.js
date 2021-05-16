const ulid = require('ulid');
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({ useAccelerateEndpoint: true });

module.exports.handler = async (event) => {
  const id = ulid.ulid();
  let key = `${event.identity.username}/${id}`;

  const extension = event.arguments.extension;
  if (extension) {
    key += extension.startsWith('.') ? extension : `.${extension}`;
  }

  const contentType = event.arguments.contentType || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('Content type should be an image');
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ACL: 'public-read',
    ContentType: contentType,
  };
  const signedUrl = s3.getSignedUrl('putObject', params); // use createPresignedPost for more control

  return signedUrl;
};
