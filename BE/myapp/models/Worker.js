import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const workerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
    },
    
    phone: {
        type: String,
        required: true,
    },
    rejections: { // 거절 횟수
        type: Number,
        default: 0
    },
    // 마지막 근무날짜 및 시간 업데이트
    lastShiftStart: { // 마지막 근무 시작 시간
        type: Date,
        default: null
    },
    lastShiftEnd: { // 마지막 근무 종료 시간
        type: Date,
        default: null
    },
    
}, {
    timestamps: true
});

// 비밀번호 해싱 미들웨어
workerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 비밀번호 검증 메소드
workerSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


const Worker = mongoose.model('Worker', workerSchema);
export default Worker;