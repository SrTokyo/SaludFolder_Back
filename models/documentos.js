const mongoose = require('mongoose');

const documentoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    titulo: { type : String  , required: true},
      owner_id: { type : mongoose.Schema.Types.ObjectId , ref: 'User', required: true},
      fileURL: {type: mongoose.Schema.Types.ObjectId ,ref: 'File' , require: true},
      users: { type : Array  ,default: []}
      
});
module.exports = mongoose.model('Documento', documentoSchema); 