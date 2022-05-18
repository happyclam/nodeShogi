"use strict";

const mongoose = require("mongoose"),
      { Schema } = require("mongoose"),
      User = require("./user");
var kifuSchema = new Schema(
  {
    // title: {
    //   type: String,
    //   required: true,
    //   unique: true
    // },
    description: {
      type: String
    },
    firstPlayer: {
      type: String,
      required: true
    },
    secondPlayer: {
      type: String,
      required: true
    },
    applicant: {
      type: String,
      required: true
    },
    koma: {
      type: Array,
      default: []
    },
    kinds: {
      type: Array,
      default: []
    },
    histories: {
      type: Array,
      default: []
    },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true,
  }
);

// kifuSchema.virtual("firstName", {
//   ref: "user",
//   foreignField: "_id",
//   localField: "firstPlayer"
// kifuSchema.virtual("firstName").get(function() {
//   console.log("--- kifu.firstName");
//   User.findOne({
//     _id: this.firstPlayer
//   })
//     .then(user => {
//       console.log(user.name);
//       res.locals.kifus.firstName = user.name;
//       next();
//     })
//     .catch(error => {
//       console.log(`Error in kifu.getUserName: ${error.message}`);
//       next();
//     });
// });

// kifuSchema.virtual("secondName", {
//   ref: "user",
//   foreignField: "_id",
//   localField: "secondPlayer"
// kifuSchema.virtual("secondName").get(function() {
//   console.log("--- kifu.secondName");
//   User.findOne({
//     _id: this.secondPlayer
//   })
//     .then(user => {
//       console.log(user.name);
//       res.locals.kifus.secondName = user.name;
//       next();
//     })
//     .catch(error => {
//       console.log(`Error in kifu.getUserName: ${error.message}`);
//       next();
//     });
// });

// kifuSchema.methods.getUserName = function(id) {
//   console.log("--- kifu.getUserName()");
//   console.log("id = " + id);
//   var result = "";
//   User.findOne({
//     _id: id
//   })
//     .then(user => {
//       console.log(user);
//       console.log(user.name);
//       result = user.name;
//       console.log("result = " + result);
//     })
//     .catch(error => {
//       console.log(`Error in kifu.getUserName: ${error.message}`);
//     });
//   return result;
// };

// kifuSchema.pre("save", function(next) {
//   let kifu = this;
//   mongoose.model('kifu', kifuSchema).countDocuments(function(error, counter){
//     if(error) return next(error);
//     kifu.id = counter+1;
//   });
// });

module.exports = mongoose.model("Kifu", kifuSchema);
