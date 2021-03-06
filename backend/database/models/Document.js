const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema for documents 
// document consist of id, name, meeting id, corpus language, people mentioned in the document, original content and content enriched with the annoations
const documentSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    meetingId: {
        type: String
    },
    language: {
        type: String
    },
    annotators: {
        type: Array
    },
    mentionedPeople: [
        {
            symbol: String,
            name: String
        }
    ],
    content: {
        type: String
    },
    annotated_content: {
        type: String
    }
}, {
    collection: 'documents',
    timestamps: true
})

module.exports = mongoose.model('Document', documentSchema)