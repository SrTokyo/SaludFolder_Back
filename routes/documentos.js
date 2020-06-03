const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Documento = require('../models/documentos');
const User = require('../models/users');
const File = require('../models/files');


/* GET Documentos listing. */
router.get('/', (req, res, next) => {
    Documento.find()
        .select('_id titulo owner_id users fileURL')
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
                        fileURL: 'http://localhost:3000/files/' + doc.fileURL,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/documentos/' + doc._id
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

router.post('/', checkAuth , (req, res, next) => {
    User.findById(req.body.owner_id)
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'usuario correpondiente al owner_id no encontrado'
                });
            }
            File.findById(req.body.fileURL)
                .then(file => {
                    if (!file) {
                        return res.status(404).json({
                            message: 'file correspondiente al id(fileURL) no encontrado'
                        });
                    }
                    const documento = new Documento({
                        _id: new mongoose.Types.ObjectId(),
                        titulo: req.body.titulo,
                        owner_id: req.body.owner_id,
                        users: req.body.users,
                        fileURL: req.body.fileURL
                    });
                    return documento
                        .save()
                })
                .then(result => {
                    res.status(201).json({
                        message: '¡¡¡¡ Documento creado con exito !!!!',
                        newDocumento: {
                            _id: result._id,
                            titulo: result.titulo,
                            owner_id: result.owner_id,
                            users: result.users,
                            fileURL: 'http://localhost:3000/files/' + result.fileURL
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/documentos/' + result._id
                        }
                    });
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.get('/:idDocumento', (req, res, next) => {
    const id = req.params.idDocumento;
    Documento.findById(id)
        .select('_id titulo owner_id users fileURL')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    titulo: doc.titulo,
                    owner_id: doc.owner_id,
                    users: doc.users,
                    fileURL: 'http://localhost:3000/files/' + doc.fileURL
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
        .select('_id titulo owner_id users fileURL')
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
                            fileURL: 'http://localhost:3000/files/' + doc.fileURL,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/documentos/' + doc._id
                            }
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
                message: 'it works!!!',
                funciono: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/documentos/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/addUser/:idDocumento', checkAuth , (req, res, next) => {
    const idDoc = req.params.idDocumento;
    const userObjetivo = req.body.email;
    User.findOne({'email' : userObjetivo})
    .exec()
    .then(usr =>{
      console.log(usr);
      if(!usr){
        return res.status(404).json({
          message : 'Usuario objetivo no encontrado'
        });
      }
      Documento.findById(idDoc)
      .exec()
      .then(doc => {
        console.log(doc);
        if(!doc){
          return res.status(404).json({
            message : 'Documento no encontrado'
          });
        }
        const newUser = doc.users;
        newUser.push({
          _id_user: usr._id,
          email: usr.email,
        });
        console.log(newUser);
        User.update({ _id: doc._id}, {users: newUser})
        .exec()
        .then(result =>{
          res.status(200).json({
            message: '¡¡¡Funciono!!!',
            funciono: result,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/documentos/' + doc._id
            }
            });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ 
            message: 'No funciono el update',
            error: err });
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
