//initializeApp
'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//main lambda function
exports.sendDatabaseNotification = functions.database.ref('/messages/{messageID}').onWrite(event => {
  const messageID = event.params.messageID;
  // If message deleted function return
  if (!event.data.val()) {
    return console.log('Deleted messageID:  ', messageID);
  }
  console.log('messageID:  ', messageID);

  //get message content
  const token = admin.database().ref(`/messages/${messageID}/to`).once('value');
  const level = admin.database().ref(`/messages/${messageID}/level`).once('value');
  const message = admin.database().ref(`/messages/${messageID}/message`).once('value');
  const title = admin.database().ref(`/messages/${messageID}/title`).once('value');

  // message details.
  const payload = {
    data: {
      title: `${title}`,
      body: `${message}`,
      level: `${level}`
    }
  };

  // Set the message as high priority and have it expire after 24 hours.
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };


  // Send notification to device.
  admin.messaging().sendToDevice(token, payload, options).then(response => {
    //delete message from database
    admin.database().ref(`/messages/${messageID}`).set({});
    console.log("Successfully sent message: ", response);
  })
  .catch(function(error) {
    console.log("Error sending message: ", error);
  });
});
