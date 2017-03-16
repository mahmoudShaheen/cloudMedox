//initializeApp
'use strict';
var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendDatabaseNotification = functions.database.ref('/messages/{messageID}}').onWrite(event => {
  const messageID = event.params.messageID;
  // If message deleted function return
  if (!event.data.val()) {
    return console.log('Deleted messageID:  ', messageID);
  }
  console.log('messageID:  ', messageID);
