import postgres from 'postgres';

const sql = postgres('postgresql://neondb_owner:npg_Z7osBbRhf1tl@ep-billowing-darkness-aqbj3ur2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export default sql;