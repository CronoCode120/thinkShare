import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});


export default function getSignature(req, res) {
  const { userId, type } = req.query;
  const timestamp = Math.round((new Date).getTime() / 1000);
  let signature;
  if(type === 'profile') {
    signature = cloudinary.utils.api_sign_request({
      folder: userId,
      public_id: 'profile_picture',
      timestamp: timestamp
    }, process.env.CLOUDINARY_SECRET);
  } else if(type === 'banner') {
    signature = cloudinary.utils.api_sign_request({
      folder: userId,
      public_id: 'banner_picture',
      timestamp: timestamp
    }, process.env.CLOUDINARY_SECRET);
  }
  
  res.json({ timestamp, signature });
}