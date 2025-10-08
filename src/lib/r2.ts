import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Support both R2_API and R2_API_ENDPOINT for endpoint configuration
const endpoint = process.env.R2_API_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

// Support both R2_BUCKET_NAME and R2_BUCKET
const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || ''

// Support both R2_PUBLIC_URL and R2_API for public URLs
const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_API || `${endpoint}/${bucketName}`

const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `cvs/${Date.now()}-${fileName}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  // Return public URL
  return `${publicUrl}/${key}`
}

export async function getSignedDownloadUrl(fileUrl: string): Promise<string> {
  // Extract key from URL (remove the base URL part)
  const key = fileUrl.replace(`${publicUrl}/`, '').replace(publicUrl, '')

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  // Generate signed URL valid for 1 hour
  return await getSignedUrl(r2Client, command, { expiresIn: 3600 })
}
