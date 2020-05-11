// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  console.log('event==>',event);

  try{
    return await db.collection('bill_keep').where({
      _id: _.in(event.ids),
      userInfo:event.userInfo
    }).get()
  }catch(e){
    console.log(e)
  }
}