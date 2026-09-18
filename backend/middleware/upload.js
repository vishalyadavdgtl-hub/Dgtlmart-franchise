const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Custom S3 storage engine - ACL bilkul nahi bhejta, bucket policy pe rely karta hai
const s3Storage = {
  _handleFile(req, file, cb) {
    const folderName = "dgtlmart-franchise/documents";
    const key = `${folderName}/${Date.now()}-${file.originalname}`;
    const bucket = process.env.AWS_S3_BUCKET_NAME;

    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", cb);
    file.stream.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: file.mimetype,
          // ACL bilkul nahi - bucket ACL disabled hai
        });
        await s3.send(command);

        const location = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        cb(null, {
          key,
          location,
          bucket,
          size: buffer.length,
        });
      } catch (err) {
        cb(err);
      }
    });
  },
  _removeFile(req, file, cb) {
    cb(null);
  },
};

const upload = multer({
  storage: s3Storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

module.exports = upload;