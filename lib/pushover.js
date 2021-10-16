const https = require("https");

const token = process.env.HOUSE_UPDATE_PUSHOVER_TOKEN;
const user = process.env.HOUSE_UPDATE_PUSHOVER_USER;

const post = ({ title, message }) => {
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.pushover.net/1/messages.json');

    const options = {
      hostname: url.host,
      port: 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    };

    const req = https.request(options, res => {
      const chunks = [];

      res.on("data", chunk => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const result = Buffer.concat(chunks).toString();

        if (res.statusCode === 302) {
          console.info(res.headers);
        }

        resolve({
          statusCode: res.statusCode,
          result,
        });
      });
    });

    req.on("error", error => {
      reject(error);
    });

    req.write(`token=${token}`);
    req.write(`&user=${user}`);
    req.write(`&title=${title}`);
    req.write(`&message=${message}`);
    req.end();
  });
};

module.exports = {
    sendPushoverMessage: post,
};