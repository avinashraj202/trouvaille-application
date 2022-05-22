const { statusCodes, ErrorHandler } = require("../helper");
const { UNAUTHORIZED, INTERNAL_ERROR } = statusCodes;
const updateModel = async (
  targetModel,
  res,
  body,
  filterBody,
  updateFields
) => {
  let data = {};
  let modelName = targetModel.name;
  let updateBody = {};
  for (let key in body) {
    if (updateFields.includes(String(key))) {
      updateBody[key] = body[key];
    }
  }
  await targetModel
    .findOne(filterBody)
    .then(function (obj) {
      if (obj) {
        obj.update(updateBody);
        data = obj.dataValues;
      } else {
        throw new ErrorHandler(UNAUTHORIZED, `Unauthorized access!`);
      }
    });

  return data;
};

module.exports = {
  updateModel,
};
