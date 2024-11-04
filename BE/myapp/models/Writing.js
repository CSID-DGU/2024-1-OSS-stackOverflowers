// models/Writing.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const WritingSchema = new Schema({
    title: String,
    contents: String,
    date: {
        type: Date,
        default: Date.now,
    }
});


// Writing 모델 생성
export default mongoose.model('Writing', WritingSchema);
