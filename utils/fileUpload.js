const formidable = require("formidable");
const moment = require('moment');
var path = require('path');
const fs = require('fs');


const isFileValid = (file, ext = ["jpg", "jpeg", "png", "pdf", "mp4"]) => {
  
  const fName = file.name.split(".");
  let type = fName[fName.length - 1];
  const validTypes = ext;
  if (validTypes.indexOf(type) === -1) {
    return false;
  }
  return true;
};

const updateFile = async (file, index, filePath) => {
  const fName = file.name.split(".");
  let ext = fName[fName.length - 1];
  const filename = moment().valueOf() +"-"+index+ "." + ext;
  var newPath = path.join(__dirname+ "/../public", filePath) + filename;
  file.mv(newPath, (err) => {
    if (err) {
      throw err;
    }
  });
  return filePath + filename;
}

module.exports = {
  updateFile,
  isFileValid,
};
