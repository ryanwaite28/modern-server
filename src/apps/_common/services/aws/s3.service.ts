import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

// Set the AWS Region.
const REGION = "us-east-1"; // e.g. "us-east-1"
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

// https://www.npmjs.com/package/s3-upload-stream

export class AwsS3Service {
  static readonly s3Client = s3Client;

  // create

  static async createBucket(Bucket: string) {
    try {
      const data = await s3Client.send(new CreateBucketCommand({ Bucket }));
      console.log({ data });
      console.log("Successfully created a bucket called:", data.Location);
      return data; // For unit tests.
    } 
    catch (err) {
      console.log("Error", err);
      return {
        err
      };
    }
  }

  static async createObject(params: {
    Bucket: string, // The name of the bucket. For example, 'sample_bucket_101'.
    Key: string, // The name of the object. For example, 'sample_upload.txt'.
    Body: any, // The content of the object. For example, 'Hello world!".
  }) {
    try {
      const results = await s3Client.send(new PutObjectCommand(params));
      console.log(
          "Successfully created " +
          params.Key +
          " and uploaded it to " +
          params.Bucket +
          "/" +
          params.Key
      );
      
      return results; // For unit tests.
    } catch (err) {
      console.log("Error", err);
      return {
        err
      };
    }
  }

  // get

  static async getObject(params: {
    Bucket: string // The name of the bucket. For example, 'sample_bucket_101'.
    Key: string, // The name of the object. For example, 'sample_upload.txt'.
  }) {
    try {
      const results = await s3Client.send(new GetObjectCommand(params));
      console.log(
          "Successfully fetched " +
          params.Key +
          " and uploaded it to " +
          params.Bucket +
          "/" +
          params.Key
      );
      return results; // For unit tests.
    } catch (err) {
      console.log("Error", err);
      return {
        err
      };
    }
  }

  // delete

  static async deleteBucket(Bucket: string) {
    try {
      const data = await s3Client.send(new DeleteBucketCommand({ Bucket }));
      console.log(data);
      return data; // For unit tests.
    } catch (err) {
      console.log("Error", err);
      return {
        err
      };
    }
  }

  static async deleteObject(params: {
    Bucket: string, // The name of the bucket. For example, 'sample_bucket_101'.
    Key: string, // The name of the object. For example, 'sample_upload.txt'.
  }) {
    try {
      const results = await s3Client.send(new DeleteObjectCommand(params));
      console.log(
          "Successfully deleted " +
          params.Key +
          " from bucket " +
          params.Bucket
      );
      
      return results; // For unit tests.
    } 
    catch (err) {
      console.log("Error", err);
      return {
        err
      };
    }
  }
}