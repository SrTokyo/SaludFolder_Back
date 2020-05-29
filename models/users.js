const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nombre: { type : String  , required: true},
      apellidos: { type : String  , required: true},
      nit: { type : String  , required: true},
      nit_tipo: { type : String  , required: true},
      email: { type : String  , required: true},
      password: { type : String  , required: true},
      user_tipo: { type : String  , required: true},
      accesoLVL: { type : Number , required: true},
      documentos: { type : Array  , required: true}
});
module.exports = mongoose.model('User', usersSchema); 