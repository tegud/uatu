module.exports = {
    doorEvent: async (event) => {
        console.log(event);
        return {
            statusCode: 200,
        };
    }
};