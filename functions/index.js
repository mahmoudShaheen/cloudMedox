//initializeApp
'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//main lambda function
exports.sendDatabaseNotification = functions.database.ref('/users/{userID}/notification/{messageID}').onWrite(event => {
  const messageID = event.params.messageID;
  const userID = event.params.userID;
  // If message deleted function return
  if (!event.data.val()) {
    return console.log('Deleted messageID:  ', messageID);
  }
  console.log('messageID:  ', messageID);

  //get message content
  const toPromise = admin.database().ref(`/users/${userID}/notification/${messageID}/to`).once('value');
  const levelPromise = admin.database().ref(`/users/${userID}/notification/${messageID}/level`).once('value');
  const messagePromise = admin.database().ref(`/users/${userID}/notification/${messageID}/message`).once('value');
  const titlePromise = admin.database().ref(`/users/${userID}/notification/${messageID}/title`).once('value');

  return Promise.all([toPromise, levelPromise, messagePromise, titlePromise]).then(results => {

    const to = results[0].val();
    const level = results[1].val();
    const message = results[2].val();
    const title = results[3].val();

    // message details.
    const payload = {
      data: {
        title: `${title}`,
        message: `${message}`,
        level: `${level}`
      }
    };
    console.log("payload: ",payload);
    console.log("Reciever: ",to);
    //get user token watch or mobile
    const tokenPromise = admin.database().ref(`/users/${userID}/token/${to}`).once('value');
    return Promise.all([tokenPromise]).then(results => {
      const token = results[0].val();
      console.log('token:  ', token);
      // Set the message as high priority and have it expire after 24 hours.
      const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };

      // Send notification to device.
      admin.messaging().sendToDevice(token, payload, options).then(response => {
        console.log("Successfully sent message: ", response);
      })
      .catch(function(error) {
        console.log("Error sending message: ", error);
      });
    });
  });
});
