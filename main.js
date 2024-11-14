import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const HOST = "https://picaapi.picacomic.com/";

const SIGN_IN_PATH = "auth/sign-in";
const PUNCH_IN_PATH = "users/punch-in";

const API_KEY = "C69BAF41DA5ABD1FFEDC6D2FEA56B";

const API_SECRET =
  "~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn";

const STAIC_HEADERS = {
  accept: "application/vnd.picacomic.com.v1+json",
  "api-key": API_KEY,
  "app-build-Version": "45",
  "app-channel": "3",
  "app-platform": "android",
  "app-version": "2.2.1.3.3.4",
  "app-uuid": "defaultUuid",
  "content-type": "application/json; charset=UTF-8",
  "image-quality": "original",
  "user-agent": "okhttp/3.8.1",
};

function handleError(response) {
  throw new Error(
    "Response Error" +
      " - " +
      response.code +
      " - " +
      response.error +
      " - " +
      response.message
  );
}

function getSignature(path, time, nonce, method) {
  // order: path + time + nonce + method + API_KEY
  let rawSignature = path + time + nonce + method + API_KEY;
  // toLowerCase
  let rawSignatureLower = rawSignature.toLowerCase();

  return CryptoJS.HmacSHA256(rawSignatureLower, API_SECRET).toString(
    CryptoJS.enc.Hex
  );
}

function generateHeaders(method, path) {
  // nonce
  let nonce = uuidv4().replace(/-/g, "");
  // timestamp
  let time = Math.floor(new Date().getTime() / 1000).toString();
  // signature
  let signature = getSignature(path, time, nonce, method);

  return {
    ...STAIC_HEADERS,
    nonce,
    signature,
    time,
  };
}

// get token
async function signIn(email, passwd) {
  let headers = generateHeaders("POST", SIGN_IN_PATH);

  let postBody = JSON.stringify({
    email,
    password: passwd,
  });

  let response = await fetch(HOST + SIGN_IN_PATH, {
    method: "POST",
    headers,
    body: postBody,
  });

  response = await response.json();

  if (response.code !== 200) {
    handleError(response);
  }

  return response.data.token;
}

// punch in
async function punchIn(token) {
  let headers = generateHeaders("POST", PUNCH_IN_PATH);

  let response = await fetch(HOST + PUNCH_IN_PATH, {
    method: "POST",
    headers: {
      ...headers,
      Authorization: token,
    },
  });

  response = await response.json();

  if (response.code === 200) {
    let res = response.data.res;

    if (res.ststus === "success") {
      console.log("成功打哔咔。");
    } else {
      console.log("今天已经打过哔咔了。");
    }
  } else {
    handleError(response);
  }
}

async function main() {
  let email = "";
  let passwd = "";

  if (process.env.EMAIL && process.env.PASSWD) {
    email = process.env.EMAIL;
    passwd = process.env.PASSWD;
  } else {
    console.log("未检测到环境变量。");
    process.exit(1);
  }

  // Sign in to get the token.
  let token = await signIn(email, passwd);

  // Punch in.
  punchIn(token);
}

main();
