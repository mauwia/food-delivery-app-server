// @ts-ignore
var ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey : process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey : process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint : process.env.IMAGE_KIT_URL_ENDPOINT,
});

export const uploadImage = async (image: Express.Multer.File, id) => {
  try {
    const response = await imagekit.upload({
      useUniqueFileName: false,
      file: image.buffer.toString('base64'),
      fileName: `${image.fieldname}_${id}`,
      folder: process.env.KYC_UPLOAD_FOLDER,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }  
}
