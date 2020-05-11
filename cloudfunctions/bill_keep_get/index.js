// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 拿到数据库引用
const db = cloud.database()
// 引用command对象
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {

  console.log("event==>",event)
  // 想实现一个根据传入字段来查询数据库数据的云函数
  //start 和 end 为必须传递参数
  // 其他的字段需要增加
  // 在这里构造向数据库传递的data
  /*
  {
    date:_.gte(event.start).and(_.lt(event.end)),
    userInfo:event.userInfo
  }
  
  */
  let data = {};
  // data.date = _.gte(event.start).and(_.lt(event.end));
  Object.defineProperties(event,{
    start:{
      enumerable:false
    },
    end:{
      enumerable:false
    }
  })
  
  for(let key in event){
    data[key] = event[key];
  }
  
  console.log("data==>",data)
  console.log("event.start==>",event.start)
  console.log("event.end==>",event.end)
  try{
    // 查询时间在一个月的数据
    return await db.collection('bill_keep').where({...data,
      date:_.gte(event.start).and(_.lt(event.end))
    }).get()
  }catch(e){
    console.log(e)
  }
}