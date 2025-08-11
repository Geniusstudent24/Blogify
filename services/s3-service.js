require("dotenv").config();
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function deleteS3File(fileUrl) {
  try {
    const fileKey = new URL(fileUrl).pathname.substring(1);
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`Successfully deleted ${fileKey} from S3.`);
  } catch (error) {
    console.error(`Failed to delete file from S3: ${fileUrl}`, error);
  }
}

module.exports = {
  s3,
  deleteS3File,
};
