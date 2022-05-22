const bcrypt = require("bcrypt");


const { SALT_ROUNDS } = require("./constant");

const generateHash = async (password) => {
    const hash = await new Promise((resolve, reject) => {
        bcrypt.hash(password, SALT_ROUNDS, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })

    return hash;
}

const checkHash = async (password, hash) => {
    const check = await new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            if (!result) {
                resolve(false);
            }
            else {
                resolve(true)
            }
        });
    })
    return check;
}


module.exports = {
    generateHash, checkHash
}
