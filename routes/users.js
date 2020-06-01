var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/users');


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
            documentos: doc.documentos,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/users/' + doc._id
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

router.post('/singup', (req, res, next) => {
  User.find({ email: req.body.email })
  .exec()
  .then(uer => {
    console.log(1);
    console.log(uer);
    if(uer.length >= 1){
      console.log(2);
      return res.status(409).json({
        Message: 'email already use'
      });
    }else{
      console.log(3);
      User.find({nit : req.body.nit})
      .exec()
      .then(usr =>{
        if(usr.length >= 1){
          return res.status(409).json({
            Message: 'nit already use'
          });
        }else{
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
                    message: ' user created',
                    newUser: result,
                    request: {
                      type: 'GET',
                      url: 'http://localhost:3000/users/' + result._id
                    }
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
        res.status(404).json({ message: 'The id isnt found, it can be wrong it just wasnt ever created' })
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
        res.status(404).json({ message: 'The email isnt found, it can be wrong it just wasnt ever created' })
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
        message: 'it works!!!',
        funciono: result,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/users/' + id
        }
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
        message: 'user deleted!!!!',
        funciono: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
