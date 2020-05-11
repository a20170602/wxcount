// miniprogram/pages/showBill/showBill.js
Page({

  data:{
    // 需要展示的数据
    showData:[]
  },

  onLoad: function(options) {

    // {res: Array(3), zhichu: 740.85, shouru: 0, date: "04月17日 星期五"}
    // 1: {res: Array(6), zhichu: 671, shouru: 125, date: "04月15日 星期三"}
    // 2: {res: Array(2), zhichu: 0, shouru: 1000, date: "04月14日 星期二"}
    // 3: {res: Array(1), zhichu: 100, shouru: 0, date: "04月09日 星期四"}
    // 4: {res: Array(1), zhichu: 0, shouru: 500, date: "04月01日 星期三"}
    

    // 获取所有数据，构造结构
    this.getBillAll();
  },
  getBillAll(){

    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
          name: 'bill_keep_getAll',
          success: res => {
            this.showMsg("加载成功");
            // 把数据构造好啦
            let showData = this.makeReturnData(res.result.data);
            console.log(showData)

            this.setData({
              showData
            })

          },
          fail: err => {
            this.showMsg("加载失败");
            console.error('[云函数] [bill_keep_getByIds] 调用失败', err)
          }
    })




  },


  // 补零函数
  addZero(num){
    return num >= 10 ? num : '0' + num;
  },

  // 展示信息
  showMsg(msg){
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000,
        mask:true
      })
  },

  // 处理返回来的数据
  makeReturnData(data){
      // 第一步，同一天的放一起
      let dates = [];
  
      data.forEach(v =>{
        if(!dates.includes(v.date)){
          dates.push(v.date);
        }
      })
      let makeData = []; //构造的数据 
      for(let i = 0; i < dates.length ;i++){
        let o = {};
        o.res = [];
        o.date = this.formatDate(dates[i]);
        o.cost = data[0].cost;
        for(let j = 0; j < data.length; j++){
          if(data[j].date == dates[i]){
            o.res.push(data[j]);
          }
        }
        makeData.push(o);
      }
      // 按日期排序
      makeData.sort((a,b)=> +new Date(b.res[0].date) - +new Date(a.res[0].date));
      
      console.log("makeData==>",makeData)

      return makeData;
  },

   // 转换成几月几日 星期几
   formatDate(str){
    let time = new Date(str);

    let y = time.getFullYear();

    let m = time.getMonth() + 1;

    let d = time.getDate();




    return `${y}-${this.addZero(m)}-${this.addZero(d)}`

  },
  deleteItem(e){

    wx.showLoading({
      title: '删除中',
    })

    console.log(e)
    // bill_keep_delete
    let id = e.currentTarget.dataset.id;
    let i = e.currentTarget.dataset.idx;
    let j = e.currentTarget.dataset.jdx;

    let showData = this.data.showData;

    // 删除一个
    showData[i].res.splice(j,1);



    // 根据字段删除数据
    wx.cloud.callFunction({
      name: 'bill_keep_delete',
      data:{_id:id},
      success: res => {
        this.showMsg("删除成功");
        // 然后删除前端数据
        this.setData({
          showData
        })
      },
      fail: err => {
        this.showMsg("删除失败");
        console.error('[云函数] [bill_keep_getByIds] 调用失败', err)
      }
    })

  }
})