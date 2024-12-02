import mongoose from 'mongoose';

const { Schema } = mongoose;

const ScheduleSchema = new Schema({
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],  // 여러 이벤트를 배열로 저장
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    workers: [{
      type: String,
      required: true
    }],
    timeUnit: {
      type: Number,
      required: true
    },
    startHour: {
      type: String,
      required: true
    },
    endHour: {
      type: String,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  export default mongoose.model('Schedule', ScheduleSchema);