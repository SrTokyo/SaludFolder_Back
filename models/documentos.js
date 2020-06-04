const mongoose = require('mongoose');

const documentoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    titulo: { type : String , default: ""},
      owner_id: { type : mongoose.Schema.Types.ObjectId , ref: 'User'},
      fileName: {type: String, default: ""},
      users: { type : Array  ,default: []},
      filetipo: {type : String, default: ""}
});
module.exports = mongoose.model('Documento', documentoSchema); 