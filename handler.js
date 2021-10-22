const { sendSlackMessage } = require('./lib/slack');
const { sendPushoverMessage } = require('./lib/pushover');

const toTitleCase = (input) => input.split('-').map(s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`).join(' ');

const SLACK_COLORS = ['good', 'warning', 'danger'];

const stateText = ({ state }) => `${state}${state.substring(state.length - 1) === 'e' ? 'd' : 'ed'}`;

module.exports = {
    doorEvent: async (event) => {
        const body = JSON.parse(event.body || '{}');
        const STATE_MAP = {
            'open': 'warning',
            'close': 'good',
        };
        
        const createSlackMessage = (body) => {
            const title = `${toTitleCase(body.device)} ${stateText(body)}`;
            const color = STATE_MAP[body.state];
            return { title, color };
        }

        await Promise.all([
            sendSlackMessage(createSlackMessage(body)),
            sendPushoverMessage({ title: 'House Update', message: `${toTitleCase(body.device)} ${stateText(body)}` }),
        ]);

        return {
            statusCode: 200,
        };
    },
    smartThings: async (event) => {
        const body = JSON.parse(event.body || '{}');
        const STATE_MAP = {
            'open': 'warning',
            'closed': 'good',
        };
        const { id, value, name, description } = body;

        if (name !== 'contact') {
            console.log(body);
            return { statusCode: 200 };
        }

        await Promise.all([
            sendSlackMessage({ title: description, color: STATE_MAP[value] }),
            sendPushoverMessage({ title: 'House Update', message: description }),
        ]);

        return {
            statusCode: 200,
        };
    },
    homeAssistant: async (event) => {
        const STATE_MAP = {
            'open': 'warning',
            'closed': 'good',
        };
        
        const { device, state } = event.queryStringParameters;
        const description = `${toTitleCase(device)} ${stateText({ state })}`;
        
        await Promise.all([
            sendSlackMessage({ title: description, color: STATE_MAP[state] }),
            sendPushoverMessage({ title: 'House Update', message: description }),
        ]);

        return {
            statusCode: 200,
        };
    },
};
