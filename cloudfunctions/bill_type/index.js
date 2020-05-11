// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  
  // 调用云端函数，拿取数据
  try {
    // 拿去数据库数据
    return await db.collection('bill_type').get();
  }catch (err) {
    console.log(err)
  }
}