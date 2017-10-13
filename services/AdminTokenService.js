const jwt = require('jsonwebtoken');


let adminToken;


class AdminTokenService {

    static getToken () {
        return AdminTokenService.adminToken;
    }

    static setToken (token) {
        AdminTokenService.adminToken = token;
    }
    
}



module.exports = AdminTokenService;