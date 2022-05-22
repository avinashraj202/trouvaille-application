const Joi = require("joi");
const { ErrorHandler } = require("../helper");
const { statusCodes } = require("../helper");

const { BAD_GATEWAY } = statusCodes;

const schemas = {
  auth_oauth_: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

/**
 *
 * The validator middleware checks for the request body in each APIs. 
 * 
 * For each API a key is created which is checked from the @schemas variable. 
 * If the key matches all the request body is checked. If the request body is not found 400 error code
 * is thrown. If there are no matching keys the next middleware is called.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express next middleware function
 * @returns
 */

const validator = (req, res, next) => {
  console.log(req.path);
  try {
    const key = req.path.split("/").splice(2).join("_").split("-").join("_");
    console.log({ key: key });
    const schema = schemas[key];
    if (schema === undefined) {
      return next();
    } else {
      const { value, error } = schema.validate(req.body);
      if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
      else next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = validator;
