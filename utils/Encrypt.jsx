import CryptoJS from "crypto-js";

const secretKey = "mebe23";
const Encrypt = (word, key = secretKey) => {
  let encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key).toString();
  let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  return encData;
};

export default Encrypt;
