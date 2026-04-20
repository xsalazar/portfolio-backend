import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client();

export const handler = async (event, context) => {
  console.log(JSON.stringify(event));

  const bucketName = "xsalazar-portfolio-data";

  // Update image data through API with valid token and query param
  if (
    event.queryStringParameters &&
    event.queryStringParameters.token &&
    event.queryStringParameters.token === process.env.PORTFOLIO_API_KEY &&
    event.queryStringParameters.updateImageData &&
    event.requestContext.http.method === "PATCH"
  ) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: "images/data.json",
          Body: event.body,
          ContentType: "application/json",
        }),
      );

      // Clean up any removed images from S3
      await deleteUnreferencedImages(bucketName, event.body);

      // Return updated image data
      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: event.body,
      };
    } catch (e) {
      console.log(JSON.stringify(e, ["name", "message", "stack"]));

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 500,
        headers: {},
        body: "",
      };
    }
  }

  // Upload images through API with valid token
  if (
    event.queryStringParameters &&
    event.queryStringParameters.token &&
    event.queryStringParameters.token === process.env.PORTFOLIO_API_KEY &&
    event.requestContext.http.method === "PUT"
  ) {
    const imageId = uuidv4();

    try {
      // Upload image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: `images/${imageId}-original`,
          Body: Buffer.from(event.body, "base64"),
          ContentType: "image/webp",
        }),
      );

      // Upload downscaled image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: `images/${imageId}`,
          Body: await sharp(Buffer.from(event.body, "base64"))
            .resize({
              width: 1600,
            })
            .toBuffer(),
          ContentType: "image/webp",
        }),
      );

      // Upload thumbnail image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: `images/${imageId}-thumbnail`,
          Body: await sharp(Buffer.from(event.body, "base64"))
            .resize({
              width: 256,
              height: 256,
            })
            .toBuffer(),
          ContentType: "image/webp",
        }),
      );

      const result = await insertImageId(bucketName, imageId);

      // Return updated image data
      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(result),
      };
    } catch (e) {
      console.log(JSON.stringify(e, ["name", "message", "stack"]));

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 500,
        headers: {},
        body: "",
      };
    }
  }

  // Get all images data blob
  if (
    event.queryStringParameters &&
    event.queryStringParameters.allImages &&
    event.requestContext.http.method === "GET"
  ) {
    try {
      // Check if data exists
      await s3.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: "images/data.json",
        }),
      );

      // If call above doesn't fail, get data
      const data = await s3.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: "images/data.json",
        }),
      );

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: await data.Body.transformToString(),
      };
    } catch (e) {
      console.log(JSON.stringify(e, ["name", "message", "stack"]));

      return {
        cookies: [],
        isBase64Encoded: false,
        statusCode: 500,
        headers: {},
        body: "",
      };
    }
  }
};

async function insertImageId(bucketName, imageId) {
  const data = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: "images/data.json",
    }),
  );

  let imageData = JSON.parse(await data.Body.transformToString()).data;

  imageData.unshift({ id: imageId, order: 0 });

  // Normalize remaining image positions
  for (var i = 0; i < imageData.length; i++) {
    imageData[i].order = i;
  }

  const ret = { data: imageData };

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: "images/data.json",
      Body: JSON.stringify(ret),
      ContentType: "application/json",
    }),
  );

  return ret;
}

async function deleteUnreferencedImages(bucketName, data) {
  const imageData = JSON.parse(data).data.map((x) => x.id);

  // Find all image IDs in S3 _not_ in the update data
  const images = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
    }),
  );

  const itemsToDelete = images.Contents.map((x) => x.Key)
    .filter(
      (x) =>
        !(
          x.includes("-original") ||
          x.includes("-thumbnail") ||
          x.includes("data.json")
        ),
    )
    .filter((x) => !imageData.includes(x));

  for (var i = 0; i < itemsToDelete.length; i++) {
    // Delete original
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `images/${itemsToDelete[i]}-original`,
      }),
    );

    // Delete downscaled
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `images/${itemsToDelete[i]}`,
      }),
    );

    // Delete thumbnail
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: `images/${itemsToDelete[i]}-thumbnail`,
      }),
    );
  }
}
