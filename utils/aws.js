require('dotenv/config');

const AWS = require('aws-sdk');

const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
})


module.exports = {
    s3: S3,
    setParams: (key, body,contentType) => {
        return {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL:"public-read"
        }
    },
}