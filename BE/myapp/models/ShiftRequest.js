//근무 신청 스키마
import  mongoose from 'mongoose';

const shiftRequestSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },//필수
    name: { type: String, required: true }, //필수
    start: { type: Date, required: true },//필수
    end: { type: Date, required: true },//필수
    lastShiftStart: { type: Date, required: true },//필수
    lastShiftEnd: { type: Date, required: true },//필수
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    description: String,
    rejections: { type: Number, default: 0 },
    priority: { type: Number, enum: [1, 2, 3], default: 1 }, // 우선순위 필드 추가
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ShiftRequest', shiftRequestSchema);