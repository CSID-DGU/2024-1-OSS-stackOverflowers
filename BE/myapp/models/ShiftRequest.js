//근무 신청 스키마
import  mongoose from 'mongoose';


const shiftRequestSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    name: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const ShiftRequest = mongoose.model('ShiftRequest', shiftRequestSchema);
export default ShiftRequest;