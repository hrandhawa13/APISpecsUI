// src/pages/api/getApiSpecs.ts

import { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bucketName = 'hae-nlx-frontend-dev';
  const folderPrefix = 'apiSpecs/';

  try {
    const listObjectsParams = {
      Bucket: bucketName,
      Prefix: folderPrefix,
    };

    const listObjectsResponse = await s3.listObjectsV2(listObjectsParams).promise();

    if (!listObjectsResponse.Contents || listObjectsResponse.Contents.length === 0) {
      return res.status(404).json({ error: 'No files found in the bucket' });
    }

    const filePromises = listObjectsResponse.Contents.map(async (file: any) => {
      const getObjectParams = {
        Bucket: bucketName,
        Key: file.Key!,
      };

      const fileData = await s3.getObject(getObjectParams).promise();

      return {
        specName: file.Key,
        content: fileData.Body?.toString('utf-8') || '',
      };
    });

    const apiSpecs = await Promise.all(filePromises);

    res.status(200).json(apiSpecs);
  } catch (error) {
    console.error('Error fetching API specs:', error);
    res.status(500).json({ error: 'Failed to fetch API specs from S3' });
  }
}
