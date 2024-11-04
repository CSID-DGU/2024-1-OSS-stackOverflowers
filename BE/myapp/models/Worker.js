import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const workerSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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