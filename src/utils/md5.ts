import {md5} from "js-md5";


function HashMd5String(value) {
  const data = md5(value);
  return BinaryToHex(data);
}

function BinaryToHex(data) {
  let hash = "";
  for (let i = 0; i < data.length; i++) {
    hash += data[i].toString("X2").toUpperCase();
  }
  return hash;
}

export default function getMd5(loginName, password) {
  const np = loginName.toLowerCase() + "t" + password;
  const hash = HashMd5String(np);
  const retHash = hash.substring(16) + hash.substring(0, 16);
  return retHash;
}