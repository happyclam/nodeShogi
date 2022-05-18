"use strict";

const mongoose = require("mongoose"),
  { Schema } = mongoose;

var subscriberSchema = new Schema(
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
    kifus: [
      {
        type: Schema.Types.ObjectId,
        ref: "Kifu"
      }
    ]
  },
  {
    timestamps: true
  }
);

subscriberSchema.methods.getInfo = function() {
  return `Name: ${this.name} Email: ${this.email}`;
};

// subscriberSchema.pre("save", function(next) {
//   let subscriber = this;
//   mongoose.model('subscriber', subscriberSchema).countDocuments(function(error, counter){
//     if(error) return next(error);
//     subscriber.id = counter+1;
//   });
// });

module.exports = mongoose.model("Subscriber", subscriberSchema);
