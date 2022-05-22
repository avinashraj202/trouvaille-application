const AWS = require("aws-sdk");

const {
    MAIL_ACCESS_ID : awsAccessKeyId,
    MAIL_ACCESS_KEY : awsSecretAccessKey,
    MAIL_EMAIL_ID :  mailEmailId
} = process.env;

AWS.config.update({
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
    region: 'ap-south-1'
});

const sendMail = (ToAddresses, message, subject) => {
    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
    console.log(ToAddresses, awsAccessKeyId, awsSecretAccessKey, mailEmailId)
    const params = {
      Destination: {
        ToAddresses:ToAddresses // Email address/addresses that you want to send your email
      },
      // ConfigurationSetName: 'dst',
      Message: {
        Body: {
          Html: {
            // HTML Format of the email
            Charset: "UTF-8",
            Data: message
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject
        }
      },
      Source: mailEmailId
    };
    
    const sendEmail = ses.sendEmail(params).promise();
    
    sendEmail
      .then(data => {
        console.log("email submitted to SES", data);
        // console.log("Mail sent to " + BccAddresses);
      })
      .catch(error => {
        console.log(error);
      });
  }

module.exports = {
    sendMail
}