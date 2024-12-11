// 파일명: createShiftRequestDummyData.js
import mongoose from 'mongoose';
import ShiftRequest from '../models/ShiftRequest.js'; // ShiftRequest 모델 경로 수정

// MongoDB 연결 설정
mongoose.connect('mongodb+srv://kehahahaaaa:dbstjrrb0107@shiftmatedb.ggjs2.mongodb.net/?retryWrites=true&w=majority', {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const createDummyData = async () => {
    try {
        // 더미 데이터
        const dummyData = [
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'John Doe',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-01T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-01T18:00:00.000Z'),
                status: 'Pending',
                priority: 1,
                rejections: 0,
            },
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'Jane Smith',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-02T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-02T18:00:00.000Z'),
                status: 'Pending',
                priority: 2,
                rejections: 1,
            },
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'Alice Johnson',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-03T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-03T18:00:00.000Z'),
                status: 'Pending',
                priority: 1,
                rejections: 0,
            },
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'Robert Brown',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-04T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-04T18:00:00.000Z'),
                status: 'Pending',
                priority: 3,
                rejections: 2,
            },
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'Emily Davis',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-05T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-05T18:00:00.000Z'),
                status: 'Pending',
                priority: 2,
                rejections: 1,
            },
            {
                workerId: new mongoose.Types.ObjectId(),
                userName: 'Chris Wilson',
                start: new Date('2024-12-10T09:00:00.000Z'),
                end: new Date('2024-12-10T09:00:00.000Z'),
                lastShiftStart: new Date('2024-12-06T09:00:00.000Z'),
                lastShiftEnd: new Date('2024-12-06T18:00:00.000Z'),
                status: 'Pending',
                priority: 1,
                rejections: 0,
            },
        ];

        // 데이터 삽입
        await ShiftRequest.insertMany(dummyData);
        console.log('Dummy data inserted successfully!');
    } catch (error) {
        console.error('Error inserting dummy data:', error);
    } finally {
        // MongoDB 연결 종료
        mongoose.connection.close();
    }
};

createDummyData();
