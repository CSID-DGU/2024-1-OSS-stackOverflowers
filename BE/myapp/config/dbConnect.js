//import cl from'@fullcalendar/core/internal-common';
import mongoose from 'mongoose';
import 'dotenv/config';

const dbConnect = async () => {
    try{
        const connect = await mongoose.connect(process.env.DB_CONNECT);
        console.log("데이터베이스와 연결되었습니다.");
    } catch(err){
        console.log(err);
    }
};

export default dbConnect;