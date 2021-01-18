const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    language: {
        type: String
    },
    content: {
        type: String
    },
    annotated_content: {
        type: String
    }
}, {
    collection: 'documents'
})

module.exports = mongoose.model('Document', documentSchema)