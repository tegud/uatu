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

const toTitleCase = (input) => input.split('-').map(s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`).join(' ');

const SLACK_COLORS = ['good', 'warning', 'danger'];
const STATE_MAP = {
    'open': 'warning',
    'close': 'good',
};

module.exports = {
    doorEvent: async (event) => {
        const body = JSON.parse(event.body || '{}');
        const title = `${toTitleCase(body.device)} ${body.state}ed`;
        const color = STATE_MAP[body.state];

        sendMessage( {
            title,
            color,
        });

        return {
            statusCode: 200,
        };
    }
};