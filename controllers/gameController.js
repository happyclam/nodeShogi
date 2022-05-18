"use strict";

const Message = require("../models/message"),
      User = require("../models/user"),
      Kifu = require("../models/kifu");

module.exports = io => {
  io.on("connection", client => {
    let localUsername = client.handshake.query.name;
    let filter = {name: localUsername};
    let update = {socketId: client.id};
    console.log("--- gameController.io.on");
    console.log(`client.id= ${client.id}`);
    // console.log(client.handshake.query.name);
    console.log(filter);
    console.log(update);
    User.findOneAndUpdate(filter, update)
      .then(user => {
        client.emit("logged in", localUsername);
      })
      .catch(error => {
        console.log(`Error in io.on.connection:${error.message}`);
      });

    // User.findAndModify({
    //   query: {name: localUsername},
    //   update: {$set: {socketId: client.id}}
    // })
    //   .then(user => {
    //     client.emit("logged in", localUsername);
    //   })
    //   .catch(error => {
    //     console.log(`Error in io.on.connection:${error.message}`);
    //   });

    client.on("disconnect", () => {
      console.log("user disconnected");
      console.log(client.id);
      // User.findOneAndUpdate(filter, update)
      //   .then(user => {
      //     // client.emit("logged out", localUsername);
      //   })
      //   .catch(error => {
      //     console.log(`Error in io.on.disconnect:${error.message}`);
      //   });
    });

    client.on("apply", data => {
      console.log("--- gameController.on.apply");
      console.log(client.id);
      console.log(data);
      console.log(data.content);
      let messageAttributes = {
          content: data.content,
          userName: data.userName,
          user: data.userId
        },
        m = new Message(messageAttributes);
      m.save()
        .then(() => {
          console.log("data.userName:" + data.userName);
        })
        .catch(error => {
          console.log(`error: ${error.message}`);
        });
      User.findApplicantUser(data.userName)
        .exec()
        .then(user => {
          console.log(`user = ${user}`);
          let oppoId = user.socketId;
          console.log("user.socketId:" + user.socketId);
          console.log("oppoId1:" + oppoId);
          if (oppoId){
            console.log("oppoId1-1:" + oppoId);
            return oppoId;
          } else {
            console.log("oppoId1-2:" + oppoId);
            io.to(client.id).emit("noLogin", messageAttributes);
          };
        })
        .then((oppoId) =>{
          console.log("oppoId2:" + oppoId);
          // io.emit("message", messageAttributes);
          io.to(oppoId).emit("reply", messageAttributes);
        })
        .catch(error => {
          console.log(`Error in io.on.apply:${error.message}`);
        })
    });
    client.on("refuse", data => {
      console.log("--- gameController.on.refuse");
      console.log(client.id);
      console.log(data);
      console.log(data.content);
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId
      }, m = new Message(messageAttributes);
      m.save()
        .then(() => {
          console.log("data.userName:" + data.userName);
        })
        .catch(error => {
          console.log(`error: ${error.message}`);
        });
      User.findApplicantUser(data.content.applicant)
        .exec()
        .then(user => {
          console.log(`user = ${user}`);
          let oppoId = user.socketId;
          console.log("user.socketId:" + user.socketId);
          console.log("oppoId1:" + oppoId);
          io.to(oppoId).emit("refused", messageAttributes);
        })
        .catch(error => {
          console.log(`Error in io.on.refuse:${error.message}`);
        })
    });
    client.on("gameStart", data => {
      console.log("--- gameController.on.gameStart");
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId
      }, m = new Message(messageAttributes);
      let oppoId = "";
      m.save()
        .then(() => {
          console.log("data.userName0:" + data.userName);
          console.log(messageAttributes);
          return;
        })
        .then(() => {
          User.findApplicantUser(data.content.applicant)
            .exec()
            .then(user => {
              console.log(`user = ${user}`);
              oppoId = user.socketId;
              console.log("user.socketId:" + user.socketId);
              console.log("oppoId1:" + oppoId);
              // io.to(oppoId).emit("gameOrder", messageAttributes);
              return user;
            })
            .then(user => {
              console.log(`user = ${user}`);
              console.log(`messageAttributes = ${messageAttributes.user}`);
              let playerOrder = [];
              let firstPlayer = "";
              let secondPlayer = "";
              if ((Math.floor(Math.random() * 10) % 2) == 1){
                playerOrder = [messageAttributes.user, user.id];
                firstPlayer = messageAttributes.userName;
                secondPlayer = user.name;
              } else {
                playerOrder = [user.id, messageAttributes.user];
                firstPlayer = user.name;
                secondPlayer = messageAttributes.userName;
              }
              console.log(playerOrder);
              let kifuParams = {
                description: "",
                firstPlayer: firstPlayer,
                secondPlayer: secondPlayer,
                applicant: data.content.applicant,
                users: [playerOrder[0], playerOrder[1]],
                koma: [],
                kinds: [],
                histories: []
              };
              Kifu.create(kifuParams)
                .then(kifu => {
                  console.log("oppoId2:" + oppoId);
                  io.to(oppoId).emit("gameOrder", kifuParams);
                  io.to(client.id).emit("gameOrder", kifuParams);
                })
            })
            .catch(error => {
              console.log(`Error in io.on.gameStart:${error.message}`);
            })
        });
    });
    client.on("gameInit", data => {
      console.log("--- gameController.on.gameInit");
      console.log(data);
      let userId = "";
      Kifu.find({firstPlayer: data.firstPlayer, secondPlayer: data.secondPlayer})
        .sort({
          createdAt: -1
        })
        .limit(1)
        .then(kifu => {
          console.log(`kifu1 = ${kifu}`);
          return kifu[0];
        })
        .then(kifu => {
          console.log(`kifu2 = ${kifu}`);
          console.log(`kifu._id = ${kifu._id}`);
          console.log(`kifu.firstPlayer = ${kifu.firstPlayer}`);
          let filter = {name: kifu.firstPlayer};
          let update = {$push: {kifus: kifu._id}};
          User.findOneAndUpdate(filter, update)
            .then(user => {
              console.log(`user1 = ${user}`);
              // console.log(`user.kifus = ${user.kifus}`);
              userId = user.socketId;
              return user;
            });
          return kifu;
        })
        .then(kifu => {
          console.log(`kifu3 = ${kifu}`);
          console.log(`kifu._id = ${kifu._id}`);
          let filter = {_id: kifu._id};
          let update = {$push: {koma: data.koma, kinds: [data.kinds], histories: data.histories}};
          Kifu.findOneAndUpdate(filter, update)
            .then(kifu => {
              console.log(`kifu4 = ${kifu}`);
              io.to(userId).emit("gameInitialized", kifu);
              return kifu;
            })
            .then(kifu => {
              let filter = {name: kifu.secondPlayer};
              let update = {$push: {kifus: kifu._id}};
              User.findOneAndUpdate(filter, update)
                .then(user => {
                  console.log(`user2 = ${user}`);
                  io.to(user.socketId).emit("gameInitialized", kifu);
                });
            });
          return kifu;
        })
        .catch(error => {
          console.log(`Error in io.on.gameInit:${error.message}`);
        });
    });
    client.on("gameMove", data => {
      console.log("--- gameController.on.gameMove");
      console.log(data);
      console.log(`client.id = ${client.id}`);
      let oppoId = "";
      let filter = {_id: data.kifuId};
      let update = {$push: {koma: data.koma, kinds: [data.kinds], histories: data.record}};
      Kifu.findOneAndUpdate(filter, update, {returnDocument: 'after'})
        .then(kifu => {
          console.log(`kifu = ${kifu}`);
          return kifu;
        })
        .then(kifu => {
          console.log(`kifu.users = ${kifu.users}`);
          User.find({_id: {$in: [kifu.users[0], kifu.users[1]]}})
            .then(users => {
              console.log(`users = ${users}`);
              if (users[0].socketId == client.id){
                console.log("=== check 1 ===");
                io.to(users[1].socketId).emit("gameMoved", kifu);
              } else {
                console.log("=== check 2 ===");
                io.to(users[0].socketId).emit("gameMoved", kifu);
              }
            })
        })
        .catch(error => {
          console.log(`Error in io.on.gameMove:${error.message}`);
        });
    });
  });
};
