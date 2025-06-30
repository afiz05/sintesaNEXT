import CryptoJS from "crypto-js";
const secretKey = "mebe23";
export const decryptData = (queryParams) => {
  const decData = CryptoJS.enc.Base64.parse(queryParams).toString(
    CryptoJS.enc.Utf8
  );
  const bytes = CryptoJS.AES.decrypt(decData, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  return bytes;
};
