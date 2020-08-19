/**
 * Check role value inbound or outbound
 * @function
 * @param {int} role - role of user
 * @return {bool} 
 */
const checkRole = function (role) {
    if(role <= 0 || role >= 6){
        return false
    }else{
        return true
    }
}

module.exports = checkRole
