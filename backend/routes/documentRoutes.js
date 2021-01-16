const express = require('express');
const mongoose = require('mongoose');
const multer  = require('multer')
const router = express.Router();
const stream = require('stream')

let Document = require('../database/models/Document');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// post method 
router.post('/documents', upload.single("document"), (req, res, next) => {
    let content = req.file.buffer.toString('utf8')
    const document = new Document({
        _id: new mongoose.Types.ObjectId(),
        name: req.file.originalname,
        content: content
    });

    document.save().then(result => {
        res.status(201).json({
            message: "Document uploaded successfully!",
            documentCreated: {
                _id: result._id,
                document: result.document
            }
        })
    }).catch(err => {
        console.log(err),
            res.status(500).json({
                error: err
            });
    })
})

router.get("/documents", (req, res, next) => {
    Document.find().then(data => {
        res.status(200).json({
            message: "document list retrieved successfully!",
            documents: data
        });
    });
});

router.get("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        res.status(200).json({
            message: "document retrieved successfully!",
            documents: data
        });
    });
});

router.get("/documents/:id/download", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        // output document content as html
        let filename = data.name + ".html"
        var fileContents = Buffer.from(data.content, "utf8");

        var readStream = new stream.PassThrough();
        readStream.end(fileContents);
      
        res.set('Content-disposition', 'attachment; filename=' + filename);
        res.set('Content-Type', 'text/plain');
      
        readStream.pipe(res);
    });
});

router.put("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    Document.findOneAndUpdate({ '_id': documentId}, req.body).then(data => {
        res.status(200).json({
            message: "document retrieved successfully!",
            documents: data
        });
    });
});

router.delete("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    Document.deleteOne({ '_id': documentId}).then(data => {
        res.status(200).json({
            message: "document deleted retrieved successfully!",
            documents: data
        });
    });
});

module.exports = router;