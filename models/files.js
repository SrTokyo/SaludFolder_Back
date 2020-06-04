const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    file: {type: String, required: true}
      
});
module.exports = mongoose.model('Files', fileSchema); 