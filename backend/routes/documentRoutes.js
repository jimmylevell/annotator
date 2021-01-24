const express = require('express');
const mongoose = require('mongoose');
const multer  = require('multer');
const router = express.Router();
const stream = require('stream');
const fs = require('fs');
const neatCsv = require('neat-csv');
const converter = require('json-2-csv');

let Document = require('../database/models/Document');
// create multer virtual storage for temporal storage before document is saved on mongo db
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// source of annoations 
const ANNOTATION_FILE_EN = process.env.ANNOTATION_FILE_EN;
const ANNOTATION_FILE_CZ = process.env.ANNOTATION_FILE_CZ;
const ANNOTATOR = process.env.ANNOTATOR

// function which escapes characters before being parsed through regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// function to detect any people symbols (e.g (J) and extract them)
function extractPeopleChars(document) {
    let personResult = []
    const regex = /(\([A-z]\))/gm
    let people = document.content.match(regex)

    // make results unique
    people = new Set(people)

    people.forEach(person =>{
        let personObject = { symbol: "", name: "" }
        personObject.symbol = person

        personResult.push(personObject)
    })

    return personResult
}

// function which enriches a given document with the annoations
function addAnnotationsToDocument(document) {
    return new Promise(function(resolve, reject) {
        let annotatedContent = document.content
        let language = document.language
        let annoationFile = null

        // select the correct annoation file
        if(language === "English") {
            annoationFile = ANNOTATION_FILE_EN
        } else if(language === "Czech") {
            annoationFile = ANNOTATION_FILE_CZ
        } else {
            // document has no language, through error 
            reject("document does not have language")
        }

        fs.readFile(annoationFile, 'utf8' , async (err, data) => {
            if (err) {
                // error whil reading file
                console.error(err)
                reject(err)
            }
        
            // iterate through the annotation and if maybe / yes replace it with a corresponding tag within the content 
            // each annoation is given a unique key, but can occure multiple times within the document
            let id = 1
            let annotations = await neatCsv(data)
            annotations.forEach(annotation => {
                let tagStatus = ""
                let tagAnnotator = ""
                if(annotation.decision === "yes") {
                    tagStatus = "confirmed-at-type-level"
                    tagAnnotator = ANNOTATOR
                } else if (annotation.decision === "no") {
                    tagStatus = "disproved-at-type-level"
                    tagAnnotator = ANNOTATOR
                } else {
                    tagStatus = "pending-at-token-level"
                    tagAnnotator = "pending"
                }

                var regEx = new RegExp("\\b" + escapeRegExp(annotation.annotation) + "\\b", 'g');
                annotatedContent = annotatedContent.replace(regEx, function() {
                    let tag = "<NE id='" + id + "' status='" + tagStatus + "' annotator='" + tagAnnotator + "'>" + annotation.annotation + "</NE>"
                    id++
                    return tag
                })
            })

            document.annotated_content = annotatedContent
            resolve(document)
        })
    })
}

// post method - creation of a new document
router.post('/documents', upload.single("document"), (req, res, next) => {
    // read document using multer and create document objcet
    let content = req.file.buffer.toString('utf8')
    const document = new Document({
        _id: new mongoose.Types.ObjectId(),
        name: req.file.originalname,
        language: req.body.language,
        content: content,
        annotated_content: ""
    });

    // execute annoation of document
    addAnnotationsToDocument(document)
        .then(document => {
            document.mentionedPeople = extractPeopleChars(document)
            document.save().then(result => {
                res.status(201).json({
                    message: "Document uploaded successfully!",
                    documentCreated: {
                        _id: result._id,
                        document: result,
                    }
                })
        })    
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        });
    })
})

// get all documents
router.get("/documents", (req, res, next) => {
    Document.find().then(data => {
        res.status(200).json({
            message: "Document list retrieved successfully!",
            documents: data
        });
    });
});

// get specific document by id
router.get("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        res.status(200).json({
            message: "Document retrieved successfully!",
            documents: data
        });
    });
});

// provide download option of the original content as .txt of a given document
router.get("/documents/:id/orgDoc/download", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        // output document content as .txt
        let filename = data.name
        var fileContents = Buffer.from(data.content, "utf8");

        var readStream = new stream.PassThrough();
        readStream.end(fileContents);
      
        res.set('Content-disposition', 'attachment; filename=' + filename);
        res.set('Content-Type', 'text/plain');
      
        readStream.pipe(res);
    });
});

// provide download option of the mentioned people as .csv of a given document
router.get("/documents/:id/mentionedPeople/download", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        // output document content as .csv
        let filename = data.name + "_mentionedPeople.csv"

        converter.json2csv(data.mentionedPeople, (err, csv) => {
            if(err) {
                throw err
            }

            var fileContents = Buffer.from(csv, "utf8");
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
          
            res.set('Content-disposition', 'attachment; filename=' + filename);
            res.set('Content-Type', 'text/plain');
          
            readStream.pipe(res);
        }, { keys: ["symbol", "name"]})
    });
});

// provide download option of the annotated content as .xml of a given document
router.get("/documents/:id/annotatedDoc/download", (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        // output document content as xml
        let filename = data.name + "_annotated.xml"
        var fileContents = Buffer.from(data.annotated_content, "utf8");

        var readStream = new stream.PassThrough();
        readStream.end(fileContents);
      
        res.set('Content-disposition', 'attachment; filename=' + filename);
        res.set('Content-Type', 'text/plain');
      
        readStream.pipe(res);
    });
});

// get method - trigger update of the annoations
router.get('/documents/:id/reannotate', (req, res, next) => {
    let documentId = req.params.id
    Document.findOne({ '_id': documentId}).then(data => {
        // execute annoation of document
        addAnnotationsToDocument(data)
            .then(document => {
                document.mentionedPeople = extractPeopleChars(document)
                document.save().then(result => {
                    res.status(201).json({
                        message: "Document annoations updated successfully!",
                        documentCreated: {
                            _id: result._id,
                            document: result,
                        }
                    })
                })  
            })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        })
    })
})

// update document content based on document id
router.put("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    
    Document.findOneAndUpdate({ '_id': documentId}, req.body).then(data => {
        res.status(200).json({
            message: "Document updated successfully!",
            documents: data
        });
    });
});

// delete document based on id
router.delete("/documents/:id", (req, res, next) => {
    let documentId = req.params.id
    Document.deleteOne({ '_id': documentId}).then(data => {
        res.status(200).json({
            message: "Document deleted retrieved successfully!",
            documents: data
        });
    });
});

module.exports = router;