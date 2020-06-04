const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
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

const Documento = require('../models/documentos');
const User = require('../models/users');



/* GET Documentos listing. */
router.get('/', (req, res, next) => {
    Documento.find()
        .select('_id titulo owner_id users fileName filetipo')
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                documentos: doc.map(doc => {
                    return {
                        _id: doc._id,
                        titulo: doc.titulo,
                        owner_id: doc.owner_id,
                        users: doc.users,
                        fileName: doc.fileName,
                        filetipo: doc.filetipo,
                        request:{
                            type: 'DELETE',
                            url: 'http://localhost:3000/documentos/'+doc._id
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

router.post('/', checkAuth, (req, res, next) => {
    uploadToS3(req.files.foo);
    const theID = new mongoose.Types.ObjectId();
    const documento = new Documento({
        _id: theID,
        owner_id : theID,
        fileName: req.files.foo.name.split(" ").join("+"),
        filetipo: req.files.foo.mimetype
    });
    documento
        .save()
        .then(result => {
            res.status(201).json({
                message: '¡¡¡¡ File creado con exito !!!!',
                newDocumento: {
                    _id: result._id,
                    fileName: result.fileName,
                    filetipo: result.filetipo
                }
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:idDocumento', (req, res, next) => {
    const id = req.params.idDocumento;
    Documento.findById(id)
        .select('_id titulo owner_id users fileName filetipo')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    titulo: doc.titulo,
                    owner_id: doc.owner_id,
                    users: doc.users,
                    fileName: doc.fileName,
                    filetipo: doc.filetipo
                };
                res.status(200).json(response);
            } else {
                res.status(404).json({ message: 'No se encontro el id, puede ser que sea erroneo, o que no este creado con anterioridadl' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
});

router.get('/owner_id/:owner_id', (req, res, next) => {
    const owner_id = req.params.owner_id;
    Documento.find({ 'owner_id': owner_id })
        .select('_id titulo owner_id users fileName filetipo')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    count: doc.length,
                    documentos: doc.map(doc => {
                        return {
                            _id: doc._id,
                            titulo: doc.titulo,
                            owner_id: doc.owner_id,
                            users: doc.users,
                            fileName: doc.fileName,
                            filetipo: doc.filetipo
                        }
                    })
                };
                res.status(200).json(response);
            } else {
                res.status(404).json({ message: 'No se encontro el owner_id, puede ser que sea erroneo, o que no este creado con anterioridad, o que no tenga ningun documento propio agregado a él' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        }
        );
});

router.patch('/:idDocumento', checkAuth, (req, res, next) => {
    const id = req.params.idDocumento;
    const updateOps = {};
    console.log(0);
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
        console.log(1);
    }
    Documento.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: '¡¡¡Funciono!!!',
                funciono: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/addUser/:idDocumento', checkAuth, (req, res, next) => {
    const idDoc = req.params.idDocumento;
    const userObjetivo = req.body.email;
    User.findOne({ 'email': userObjetivo })
        .exec()
        .then(usr => {
            console.log(usr);
            if (!usr) {
                return res.status(404).json({
                    message: 'Usuario objetivo no encontrado'
                });
            }
            Documento.findById(idDoc)
                .exec()
                .then(doc => {
                    console.log(doc);
                    if (!doc) {
                        return res.status(404).json({
                            message: 'Documento no encontrado'
                        });
                    }
                    const newUser = doc.users;
                    newUser.push({
                        _id_user: usr._id,
                        email: usr.email,
                    });
                    console.log(newUser);
                    Documento.update({ _id: doc._id }, { users: newUser })
                        .exec()
                        .then(result => {
                            res.status(200).json({
                                message: '¡¡¡Funciono!!!',
                                funciono: result,
                                newUsers: newUser
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                message: 'No funciono el update',
                                error: err
                            });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete('/:idDocumento', checkAuth, (req, res, next) => {
    const id = req.params.idDocumento;
    Documento.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: '¡¡¡¡Documento eliminado!!!!',
                funciono: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
