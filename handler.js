const { sendSlackMessage } = require('./lib/slack');
const { sendPushoverMessage } = require('./lib/pushover');

const toTitleCase = (input) => input.split('-').map(s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`).join(' ');

const SLACK_COLORS = ['good', 'warning', 'danger'];
const STATE_MAP = {
    'open': 'warning',
    'close': 'good',
};
const stateText = ({ state }) => `${state}${state.substring(state.length - 1) === 'e' ? 'd' : 'ed'}`;

const createSlackMessage = ({ body }) => {
    const title = `${toTitleCase(body.device)} ${stateText(body)}`;
    const color = STATE_MAP[body.state];
    return { title, color };
}

module.exports = {
    doorEvent: async (event) => {
        const body = JSON.parse(event.body || '{}');

        await Promise.all([
            sendSlackMessage(createSlackMessage(body)),
            sendPushoverMessage({ title: 'House Update', message: `${toTitleCase(body.device)} ${stateText(body)}` }),
        ]);

        return {
            statusCode: 200,
        };
    }
};