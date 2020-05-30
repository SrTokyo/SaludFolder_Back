var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Documento = require('../models/documentos');
const User = require('../models/users');

/* GET Documentos listing. */
router.get('/', (req, res, next) => {
    Documento.find()
        .select('_id titulo owner_id users')
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                usuarios: doc.map(doc => {
                    return {
                        _id: doc._id,
                        titulo: doc.titulo,
                        owner_id: doc.owner_id,
                        users: doc.users,
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
/*
router.get('/', (req, res, next) => {
    res.status(500).json({
        error: 'this get way isnt supported, you only can do a get for an specific document, puting the doc_id wigth next to /documetos/(doc_id)',
    });
});*/
router.post('/', (req, res, next) => {
    User.findById(req.body.owner_id)
        .then(user => {
            if(!user){
                return res.status(404).json({
                     message: 'owner id not found'
                 });
             }
            const documento = new Documento({
                _id: new mongoose.Types.ObjectId(),
                titulo: req.body.titulo,
                owner_id: req.body.owner_id,
                users: req.body.users
            });
            return documento
                .save()
        }).then(result => {
            console.log(result);
            res.status(201).json({
                message: ' documento created',
                newDocumento: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/documentos/' + result._id
                }
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
        .select('_id titulo owner_id users')
        .exec()
        .then(doc => {
            if (doc) {
                const response = {
                    _id: doc._id,
                    titulo: doc.titulo,
                    owner_id: doc.owner_id,
                    users: doc.users
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
/*
router.get('/:email', (req, res, next) => {
  const email = req.params.email;
  res.status(202).json({
    email: email
  });
});
*/
router.patch('/:idDocumento', (req, res, next) => {
    const id = req.params.idDocumento;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
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
router.delete('/:idDocumento', (req, res, next) => {
    const id = req.params.idDocumento;
    Documento.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'documento deleted!!!!',
                funciono: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;
