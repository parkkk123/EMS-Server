
/**
 * Response function
 * @function
 * @param {boolean} status - succes or failure
 * @param {string} message - show message response
 * @param {dictionary} data - output data
 * @return {string} output - return json string
 */

const customResponse = (status, message, data = {}) => {
    var output = {}
    output['status'] = status
    output['message'] = message
    output['data'] = data
    return output
}

module.exports = customResponse
