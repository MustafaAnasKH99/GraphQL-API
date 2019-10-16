const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schemaForCounter = new Schema({
    number: Number,
})

module.exports = mongoose.model('Counter', schemaForCounter);