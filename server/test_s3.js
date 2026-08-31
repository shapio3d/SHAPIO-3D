const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function test() {
  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://bwyhjafzuhprvnviemwa.supabase.co/storage/v1/s3',
      forcePathStyle: true,
      credentials: {
        accessKeyId: '1fe6fe8bc208a30f54d7b087f2294098',
        secretAccessKey: '1b515df43ec862b446e63243059bbb711fd9c9b32cb5a2c9103db135322da0c7',
      },
    });

    const command = new PutObjectCommand({
      Bucket: 'submissions',
      Key: `uploads/test.txt`,
      Body: 'Hello world',
      ContentType: 'text/plain',
    });

    await s3Client.send(command);
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
