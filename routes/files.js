const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const Busboy = require('busboy');
const fileUpload = require('express-fileupload');


const BUCKET_NAME = 'saludfolder';
const IAM_USER_KEY = 'AKIAZPR4AQYBAEKAJGN3';
const IAM_USER_SECRET = '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';

function uploadToS3(file) {
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME
    });
    s3bucket.createBucket(function () {
        var params = {
            Bucket: BUCKET_NAME,
            Key: file.name,
            Body: file.data
        };
        console.log(params);
        s3bucket.upload(params, function (err, data) {
            if (err) {
                console.log('error in callback');
                console.log(err);
            }
            console.log('success');
            console.log(data);
        });
    });
}



const Fichero = require('../models/files');

router.get('/', (req, res, next) => {
    Fichero.find()
        .select('_id type file')
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                files: doc.map(doc => {
                    return {
                        _id: doc._id,
                        type: doc.type,
                        file: doc.file,
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

router.post('/', (req, res, next) => {
    uploadToS3(req.files.foo);
    const newFile = new Fichero({
        _id: new mongoose.Types.ObjectId(),
        file: 'https://saludfolder.s3.amazonaws.com/' + req.files.foo.name
    });
    newFile
        .save()
        .then(result => {
            console.log(1);
            console.log(result);
            console.log(1);
            res.status(201).json({
                message: '¡¡¡¡file creado con exito!!!!',
                newFile: result
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
        .select('_id type file')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    type: doc.type,
                    file: doc.file
                };
                res.status(200).json(response);
            } else {
                res.status(404).json({ message: 'No se encontro el id, puede ser que sea erroneo, o que no este creado con anterioridad' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
});

router.delete('/:idFile', (req, res, next) => {
    const id = req.params.idFile;
    Fichero.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: '¡¡¡¡file eliminado con exito!!!!',
                funciono: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
