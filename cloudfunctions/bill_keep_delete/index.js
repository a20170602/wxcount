// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 拿到数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    // 删除所有账单数据
    return await db.collection('bill_keep').where(event).remove()
  }catch(e){
    console.log(e)
  }

}