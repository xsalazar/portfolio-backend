const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  console.log(JSON.stringify(event));
  const bucketName = "xsalazar-portfolio-data";

  // Upload images from API with valid token
  if (
    event.queryStringParameters &&
    event.queryStringParameters.token &&
    event.queryStringParameters.token === process.env.PORTFOLIO_API_KEY
  ) {
    const s3 = new AWS.S3();
    const path = uuidv4();

    try {
      // Upload image to S3
      await s3
        .putObject({
          Bucket: bucketName,
          Key: path,
          Body: Buffer.from(event.body, "base64"),
          ContentType: event.headers["content-type"],
        })
        .promise();

      // Return URL to image
      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: `https://backend.xsalazar.com/?image=${path}`,
        }),
      };
    } catch (e) {
      console.log(JSON.stringify(e));

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 500,
        headers: {},
        body: "",
      };
    }
  }

  // Get image from S3
  if (event.queryStringParameters && event.queryStringParameters.image) {
    const image = event.queryStringParameters.image;
    const thumbnail = event.queryStringParameters.thumbnail === true;
    const s3 = new AWS.S3();

    // Check S3 for image, return it, if found
    try {
      // Check if data exists
      await s3.headObject({ Bucket: bucketName, Key: image }).promise();

      // If call above doesn't fail, get data
      const data = await s3
        .getObject({ Bucket: bucketName, Key: image })
        .promise();

      if (thumbnail) {
        return {
          cookies: [],
          isBase64Encoded: true,
          statusCode: 200,
          headers: { "content-type": data.ContentType },
          body: sharp(data.Body)
            .resize({ height: 165, width: 165 })
            .toBuffer()
            .toString("base64"),
        };
      }

      return {
        cookies: [],
        isBase64Encoded: true,
        statusCode: 200,
        headers: { "content-type": data.ContentType },
        body: data.Body.toString("base64"),
      };
    } catch (e) {
      console.log(JSON.stringify(e));

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 404,
        headers: {},
        body: "",
      };
    }
  }
};
