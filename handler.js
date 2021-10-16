module.exports = {
    doorEvent: (event) => {
        console.log(event);
        return { statusCode: 204 }
    }
};