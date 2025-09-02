import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { readConfig } from './config.js'

function clientForRegion(region) {
  return new S3Client({ region })
}

export async function putObject({ Bucket, Key, Body, ContentType }) {
  const { region } = readConfig()
  const s3 = clientForRegion(region)
  const cmd = new PutObjectCommand({ Bucket, Key, Body, ContentType })
  return await s3.send(cmd)
}

export async function presignGet({ Bucket, Key, expiresIn = 3600 }) {
  const { region } = readConfig()
  const s3 = clientForRegion(region)
  const cmd = new GetObjectCommand({ Bucket, Key })
  const url = await getSignedUrl(s3, cmd, { expiresIn })
  return url
}
