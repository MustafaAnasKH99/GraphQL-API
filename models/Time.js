const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schemaForTime = new Schema({
    time: String,
})

module.exports = mongoose.model('Time', schemaForTime);