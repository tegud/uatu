const https = require("https");

const webhookUrl = process.env.HOUSE_UPDATE_WEBHOOK;

const post = ({ webhookUrl, data }) => {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    const url = new URL(webhookUrl);

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

    req.write(`payload=${jsonData}`);
    req.end();
  });
};

const sendMessage = (message) => post({
  webhookUrl,
  data: {
    attachments: [
      message,
    ],
  },
});

module.exports = {
    sendSlackMessage: sendMessage,
};