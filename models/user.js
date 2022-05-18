"use strict";

const mongoose = require("mongoose"),
  { Schema } = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose"),
  bcrypt = require("bcrypt"),
  Subscriber = require("./subscriber");

var userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      lowercase: true,
    },
    //passport.jsが自動で用意するので、passwordフィールドは無くてもいい
    password: {
      type: String,
      required: true
    },
    socketId: {
      type: String,
      unique: true
    },
    //not login=0, loggedin=1, in game=2
    loginStatus: {
      type: Number,
      default: 0
    },
    subscribedAccount: { type: Schema.Types.ObjectId, ref: "Subscriber" },
    kifus: [{ type: Schema.Types.ObjectId, ref: "Kifu" }]
  },
  {
    timestamps: true
  },
);

// userSchema.virtual("fullName").get(function() {
//   return `${this.name.first} ${this.name.last}`;
// });

userSchema.pre("save", function(next) {
  let user = this;
  // mongoose.model('user', userSchema).countDocuments(function(error, counter){
  //   if(error) return next(error);
  //   user.id = counter+1;
  // });
  if (user.subscribedAccount === undefined) {
    Subscriber.findOne({
      name: user.name
    })
      .then(subscriber => {
        user.subscribedAccount = subscriber;
        bcrypt
          .hash(user.password, 10)
          .then(hash => {
            user.password = hash;
            next();
          })
          .catch(error => {
            console.log(`Error in hashing password: ${error.message}`);
            next(error);
          });
      })
      .catch(error => {
        console.log(`Error in connecting subscriber: ${error.message}`);
        next(error);
      });
  } else {
    next();
  }
});

userSchema.statics.findApplicantUser = function(applicant) {
  return this.model("User")
    .findOne({ name: applicant });
};

userSchema.plugin(passportLocalMongoose, {
  usernameField: "name"
});

module.exports = mongoose.model("User", userSchema);
