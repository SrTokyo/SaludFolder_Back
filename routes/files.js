const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 15
  },
  fileFilter: fileFilter
});

const Fichero = require('../models/files');


/* GET Files listing. */
router.get('/', (req, res, next) => {
    Fichero.find()
        .select('_id file')
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                files: doc.map(doc => {
                    return {
                        _id: doc._id,
                        file: doc.file,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/files/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
});

router.post('/',upload.single('buffer'), (req, res, next) => {
    const file = new Fichero({
        _id: new mongoose.Types.ObjectId(),
        file: req.file.buffer
    });
    file
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: ' file created',
                newFile: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/files/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});


router.get('/:idFile', (req, res, next) => {
    const id = req.params.idFile;
    Fichero.findById(id)
        .select('_id file')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    file: doc.file
                };
                res.status(200).json(response);
            } else {
                res.status(404).json({ message: 'The id isnt found, it can be wrong it just wasnt ever created' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
});

router.patch('/:idFile',upload.single('buffer'), (req, res, next) => {
    const id = req.params.idFile;
    Fichero.update({ _id: id }, { file: req.file.buffer })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'it works!!!',
                funciono: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/files/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
router.delete('/:idFile', (req, res, next) => {
    const id = req.params.idFile;
    Fichero.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'file deleted!!!!',
                funciono: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
