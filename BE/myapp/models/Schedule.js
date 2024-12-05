import mongoose from 'mongoose';

const { Schema } = mongoose;

const ScheduleSchema = new Schema({
    events: [{     //근무 타임 예)10-17시
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],  // 여러 이벤트를 배열로 저장
    startDate: {  //알고리즘 돌릴 한 주 시작날
      type: Date,
      required: true
    },
    endDate: {   //알고리즘 돌릴 한 주 끝나는 날
      type: Date,
      required: true
    },
    workers: [{   //해당 일정에 알고리즘을 돌릴 근무자
      type: String,
      required: true
    }],
    timeUnit: {  
      type: Number,
      required: true
    },
    startHour: {  //한 주 근무 시작 시간
      type: String,
      required: true
    },
    endHour: {   //한 주 근무 종료 시간
      type: String,
      required: true
    },
    deadline: {  //근무 신청 마감 기한
      type: Date,
      required: true
    },
    createdAt: { 
      type: Date,
      default: Date.now
    },
    selectionStatus: {
      type: String, 
      enum: ['Pending', 'Completed', 'Error'], default: 'Pending' 
    },
    lastProcessed: Date,
    lastError: String,
    maxWorkersPerShift: {
      type: Number,
      required: true,
      default: 3,
    }
  });

  export default mongoose.model('Schedule', ScheduleSchema);