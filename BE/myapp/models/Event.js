import mongoose from 'mongoose';

const { Schema } = mongoose;

const EventSchema = new Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: String, // optional: 상세 설명
    allDay: { type: Boolean, default: false } // optional: 하루 종일 여부
});



// Event 모델 생성
export default mongoose.model('Event', EventSchema);
