const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function(id) {
  const token = jwt.sign({ _id: id,}, config.get('jwtPrivateKey'));
  return token;
}