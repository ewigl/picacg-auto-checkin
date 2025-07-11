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
    `签到失败: ${response.code} / ${response.error} / ${response.message} / ${response.detail}`
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
async function signIn(account) {
  console.log(`【${account.name}】: 登录中...`);

  const headers = generateHeaders("POST", SIGN_IN_PATH);

  const postBody = JSON.stringify({
    email: account.email,
    password: account.passwd,
  });

  const response = await fetch(HOST + SIGN_IN_PATH, {
    method: "POST",
    headers,
    body: postBody,
  });

  const responseJson = await response.json();

  if (responseJson.code !== 200) {
    handleError(responseJson);
  }

  return { ...account, token: responseJson.data.token };
}

// punch in
async function punchIn(account) {
  console.log(`【${account.name}】: 打哔咔中...`);

  let headers = generateHeaders("POST", PUNCH_IN_PATH);

  let response = await fetch(HOST + PUNCH_IN_PATH, {
    method: "POST",
    headers: {
      ...headers,
      Authorization: account.token,
    },
  });

  response = await response.json();

  if (response.code === 200) {
    let res = response.data.res;

    if (res.status === "ok") {
      console.log(`【${account.name}】: 成功打哔咔。`);
      return `成功打哔咔。`;
    } else if (res.status === "fail") {
      console.log(`【${account.name}】: 今天已经打过哔咔了。`);
      return `今天已经打过哔咔了。`;
    }
  } else {
    handleError(response);
  }
}

// 处理
async function processSingleAccount(account) {
  const cookedAccount = await signIn(account);

  const punchInResult = await punchIn(cookedAccount);

  return punchInResult;
}

async function main() {
  let accounts;

  if (process.env.ACCOUNTS) {
    try {
      accounts = JSON.parse(process.env.ACCOUNTS);
    } catch (error) {
      console.log("❌ 账户信息配置格式错误。");
      process.exit(1);
    }
  } else {
    console.log("❌ 未配置账户信息。");
    process.exit(1);
  }

  const allPromises = accounts.map((account) => processSingleAccount(account));
  const results = await Promise.allSettled(allPromises);

  console.log(`\n======== 签到结果 ========\n`);

  results.forEach((result, index) => {
    const accountName = accounts[index].name;
    if (result.status === "fulfilled") {
      console.log(`【${accountName}】: ✅ ${result.value}`);
    } else {
      console.error(`【${accountName}】: ❌ ${result.reason.message}`);
    }
  });
}

main();
