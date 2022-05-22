const { statusCodes, authHelper, ErrorHandler } = require("../helper");
const { constant } = require("../utils");

const { OK, BAD_GATEWAY } = statusCodes;
const { SUCCESS } = constant;
const { checkAuth, checkUserType } = authHelper;

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param {*} allowedUserAccess -> User who has access to the controller function
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, allowedUserAccess) => {
  try {
    const { user } = req;
    if (allowedUserAccess) {
      if (!Array.isArray(allowedUserAccess))
        throw new ErrorHandler(
          BAD_GATEWAY,
          "allowedUserTypes should be an array"
        );
      checkAuth(user);
      checkUserType(user, allowedUserAccess);
    }

    const data = await func(req, res, next);
    if (data != null) return res.status(OK).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = dispatcher;
