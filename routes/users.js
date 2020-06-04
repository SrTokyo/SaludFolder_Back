var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const checkAuth = require('../middleware/check-auth');
const User = require('../models/users');
const Documento = require('../models/documentos');


/* GET users listing. */
router.get('/', (req, res, next) => {
  User.find()
    .select('_id nombre apellidos nit nit_tipo nacimiento email password user_tipo accesoLVL documentos')
    .exec()
    .then(doc => {
      const response = {
        count: doc.length,
        usuarios: doc.map(doc => {
          return {
            _id: doc._id,
            nombre: doc.nombre,
            apellidos: doc.apellidos,
            nit: doc.nit,
            nit_tipo: doc.nit_tipo,
            email: doc.email,
            password: doc.password,
            user_tipo: doc.user_tipo,
            accesoLVL: doc.accesoLVL,
            documentos: doc.documentos
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

router.post('/signup', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(uer => {
      console.log(1);
      console.log(uer);
      if (uer.length >= 1) {
        console.log(2);
        return res.status(409).json({
          Message: 'email ya esta siendo usado, use otro por favor'
        });
      } else {
        console.log(3);
        User.find({ nit: req.body.nit })
          .exec()
          .then(usr => {
            if (usr.length >= 1) {
              return res.status(409).json({
                Message: 'nit ya esta siendo usado, use otro por favor'
              });
            } else {
              bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                  return res.status(500).json({
                    error: err
                  });
                } else {

                  const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    nombre: req.body.nombre,
                    apellidos: req.body.apellidos,
                    nit: req.body.nit,
                    nit_tipo: req.body.nit_tipo,
                    email: req.body.email,
                    password: hash,
                    user_tipo: req.body.user_tipo,
                    accesoLVL: req.body.accesoLVL,
                    documentos: req.body.documentos
                  });
                  user.save()
                    .then(result => {
                      console.log(result);
                      res.status(201).json({
                        message: '¡¡¡¡Usuario creado exitosamente!!!!',
                        newUser: result
                      });
                    })
                    .catch(err => {
                      console.log(err);
                      res.status(500).json({ error: err });
                    });

                }
              });
            }
          });

      }
    });
});

router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(users => {
      if (users < 1) {
        return res.status(401).json({
          message: 'Autentificación fallida'
        });
      }
      bcrypt.compare(req.body.password, users[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Autentificación fallida'
          });
        }
        if(result) {
          const token = jwt.sign({
            _id: users[0]._id,
            user_tipo: users[0].user_tipo,
            accesoLVL: users[0].accesoLVL,
            email: users[0].email
          },'secret',{
            expiresIn: "1h"
          })
          return res.status(200).json({
            message: 'Autentificación exitosa',
            token: token
          });
        }
        res.status(401).json({
          message: 'Autentificación fallida'
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get('/:idUsuario', (req, res, next) => {
  const id = req.params.idUsuario;
  User.findById(id)
    .select('_id nombre apellidos nit nit_tipo nacimiento email password user_tipo accesoLVL documentos')
    .exec()
    .then(doc => {
      if (doc) {
        const response = {
          _id: doc._id,
          nombre: doc.nombre,
          apellidos: doc.apellidos,
          nit: doc.nit,
          nit_tipo: doc.nit_tipo,
          email: doc.email,
          password: doc.password,
          user_tipo: doc.user_tipo,
          accesoLVL: doc.accesoLVL,
          documentos: doc.documentos
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

router.get('/email/:email', (req, res, next) => {
  const email = req.params.email;
  User.findOne({ 'email': email })
    .select('_id nombre apellidos nit nit_tipo nacimiento email password user_tipo accesoLVL documentos')
    .exec()
    .then(doc => {
      if (doc) {
        const response = {
          _id: doc._id,
          nombre: doc.nombre,
          apellidos: doc.apellidos,
          nit: doc.nit,
          nit_tipo: doc.nit_tipo,
          email: doc.email,
          password: doc.password,
          user_tipo: doc.user_tipo,
          accesoLVL: doc.accesoLVL,
          documentos: doc.documentos
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: 'No se encontro el email, puede ser que sea erroneo, o que no este creado con anterioridad' })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    }
    );
});

router.patch('/:idUsuario', (req, res, next) => {
  const id = req.params.idUsuario;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  User.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: '!!!Funciono el update!!!',
        funciono: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch('/addDoc/:idDocumento', checkAuth , (req, res, next) => {
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
      const newDocumentos = usr.documentos;
      newDocumentos.push({
        _id_doc: doc._id,
        titulo: doc.titulo,
      });
      console.log(newDocumentos);
      User.update({ _id: usr._id}, {documentos: newDocumentos})
      .exec()
      .then(result =>{
        res.status(200).json({
          message: '¡¡¡Funciono un documento a sido agregado a un usuario!!!',
          funciono: result
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

router.delete('/:idUsuario', (req, res, next) => {
  const id = req.params.idUsuario;
  User.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: '¡¡¡¡Usuario eliminado!!!!',
        funciono: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
