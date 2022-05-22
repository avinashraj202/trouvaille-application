const MOMENT = require("moment");
const getCurrentFormattedDateTime = () => {
    return MOMENT().format("YYYY-MM-DD HH:mm:ss");
}
module.exports = {
    getCurrentFormattedDateTime
}