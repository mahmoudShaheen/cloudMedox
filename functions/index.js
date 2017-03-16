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
  const tokenPromise = admin.database().ref(`/messages/${messageID}/to`).once('value');
  const levelPromise = admin.database().ref(`/messages/${messageID}/level`).once('value');
  const messagePromise = admin.database().ref(`/messages/${messageID}/message`).once('value');
  const titlePromise = admin.database().ref(`/messages/${messageID}/title`).once('value');

  return Promise.all([tokenPromise, levelPromise, messagePromise, titlePromise]).then(results => {
    const token = results[0];
    const level = results[1];
    const message = results[2];
    const title = results[3];

    console.log(token);
    console.log(level);
    console.log(message);
    console.log(title);
    // message details.
    const payload = {
      data: {
        title: `${title}`,
        body: `${message}`,
        level: `${level}`
      }
    };
    console.log(payload)
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
});
