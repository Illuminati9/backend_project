const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { profileS3Url } = require('../utils/constants');
const { Upload } = require('@aws-sdk/lib-storage')

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    },

})

const getObjectUrl = async (key) => {
    const command = new GetObjectCommand(
        {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        }
    )
    const url = await getSignedUrl(s3Client, command);
    return url;
}

const putObjectUrl = async (fileName, contentType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${profileS3Url}/${fileName}`,
        ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command);

    return url
}

const deleteObjectUrl = async (fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${fileName}`
    })

    await s3Client.send(command);
}

const uploadImageToS3 = async (imageProps) => {
    const { fileName, contentType, imageBuffer } = imageProps;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${profileS3Url}/${fileName}`,
        ContentType: contentType,
        Body: imageBuffer
    });

    await s3Client.send(command);
}



module.exports = {
    getObjectUrl,
    putObjectUrl,
    deleteObjectUrl,
    uploadImageToS3
}