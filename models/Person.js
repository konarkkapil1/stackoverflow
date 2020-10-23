const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    name:{
        type: String,
        required: true,
        max: 30
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    username:{
        type: String,
    },
    gender:{
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: 'https://k2partnering.com/wp-content/uploads/2016/05/Person.jpg',
    },
    date:{
        type:Date,
        default: Date.now(),
        required: true,
    },
    blocked:{
        type: Boolean,
        default: false
    }
})

module.exports = Person = mongoose.model("person",PersonSchema);