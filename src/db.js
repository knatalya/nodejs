"use strict";
// db.js
var mongoose = require('mongoose');
var MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mybooks';
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(function () { return console.log('✅ MongoDB connected'); })
    .catch(function (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
module.exports = mongoose;
