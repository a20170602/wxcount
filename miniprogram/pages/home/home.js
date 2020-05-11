// miniprogram/pages/home/home.js
// const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 查询年月日
    date:'',
    // 开始日期
    start:'',
    // 结束日期
    end:'',
    // 当前年份
    year:'',
    // 当前月份
    month:'',

    //记录今天完整日期
    today:'',

    // 是否没有数据
    noData:false,

    // 展示的数据
    showData:[],

    // 顶部统计数据
    topData:{
      last:0,
      totalOut:0,
      totalIn:0
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {

  //   // 初始化事件之后
  //   this.initDate();

  //   // 想发起请求 (构建条件)
  //   let data = this.makeGetData();


  //   // 请求数据
  //   this.getBill(data);
    


  // },


  // 进入页面时候执行
  onShow(){
    // 初始化事件之后
    this.initDate();

    // 想发起请求 (构建条件)
    let data = this.makeGetData();
    
    
    // 请求数据
    this.getBill(data);

  },

  // 初始化日期
  initDate(){
    // 页面加载结束后，设置开始和结束时间
    let currentDate = this.makeDate();

    console.log("currentDate==>",currentDate);

    let dataArr = currentDate.split('-');

    // 结束时间设置
    let end = currentDate;

    // 记录今天
    this.data.today = currentDate;

    let year = dataArr[0];

    let month = dataArr[1];

    // 记录查询年月
    this.data.date = year + '-' + month + '-'+ '01';

    // 减少一年
    dataArr[0] = dataArr[0] - 1;

    // 开始时间设置
    let start = dataArr.join('-');

    // 更新数据
    this.setData({
      start,
      end,
      year,
      month
    })
  },

  // 初始化顶部数据
  initTopData(){

      // 先置空
      let topData = {
            last:0,
            totalOut:0,
            totalIn:0
          }
          this.setData({
            topData
          })

  },

  // 今天的格式化时间
  makeDate(){
    // 因为自己手机不能使用这个方法
    let time = new Date();

    console.log(time)
    // 年
    let year = time.getFullYear();

    // 月
    let month = time.getMonth() + 1;
    
    // 日
    let day = time.getDate();

    return year + '-' + this.addZero(month) + '-' + this.addZero(day);
  },

  // 补零函数
  addZero(num){
    return num >= 10 ? num : '0' + num;
  },

  // 获取当前月，用户账单
  getBill(data){
      wx.showLoading({
        title: '加载中',
      })
      // 调用云函数
      wx.cloud.callFunction({
          name: 'bill_keep_get',
          data,
          success: res => {
            wx.hideLoading();
            this.showMsg("加载成功")
            console.log('[bill_keep_get] ', res)
            

            let data = res.result.data;

            // 还需要把数据按天组合一下，归类加字段
            let showData = this.makeReturnData(data);

            let noData = showData.length == 0;

            this.setData({
              showData,
              noData
            })
          },
          fail: err => {
            wx.hideLoading();
            this.showMsg("加载失败");
            console.error('[bill_keep_get]  调用失败', err)
          }
      })
  },

  // 构建请求数据
  makeGetData(){
    // 根据当前日期构建请求数据
    let data = {
      // 2020-04-01
      start:'',
      // 2020-05-01
      end:''
    }

    // 开始事件定好了
    let dateStr = this.data.date;
    data.start = dateStr;
    
    // 往后加一个月
    let dateArr = dateStr.split('-');

    if(dateArr[1] == 12){
      dateArr[0] = +dataArr[0] + 1;
      dateArr[1] = '01';
    }else{
      dateArr[1] = this.addZero(+dateArr[1] + 1);
    }

    data.end = dateArr.join('-');

    return data
  },

  // 监听日期选择
  selectDate(e){

      console.log('e==>',e)

      // 根据选择的时间，更改当前日期
      let selTime = e.detail.value;
      let date = selTime + '-01';
      let selArr = selTime.split('-');
      let year = selArr[0];
      let month = selArr[1];

      this.setData({
        date,
        year,
        month
      })

      // 选择完日期之后，进行渲染


      // 想发起请求 (构建条件)
      let data = this.makeGetData();
    
    
      // 请求数据
      this.getBill(data);

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
    console.log('data==>',data)
    // 第一步，同一天的放一起
    let dates = [];

    data.forEach(v =>{
      if(!dates.includes(v.date)){
        dates.push(v.date);
      }
    })

    console.log('dates',dates)
    let makeData = []; //构造的数据

    
    // 先置空一下顶部数据
    this.initTopData();
    let topData = this.data.topData;

    for(let i = 0; i < dates.length ;i++){
      let o = {};
      o.res = [];
      o.zhichu = 0;
      o.shouru = 0;
      o.date = this.formatDate(dates[i]);
      for(let j = 0; j < data.length; j++){
        if(data[j].date == dates[i]){
          o.res.push(data[j]);

          // 金钱的计算需要十分注意(这里没有注意一些问题，需要更改)
          if(data[j].costType == 'zhichu'){
            o.zhichu += data[j].money*100;
          }else{
            o.shouru += data[j].money*100;
          }

        }
      }

      // 在这里计算本月总支出和总结余
      topData.totalOut += o.zhichu;

      topData.totalIn += o.shouru;

      o.zhichu = o.zhichu / 100
      o.shouru = o.shouru / 100
      makeData.push(o);
    }

    // 按日期排序
    makeData.sort((a,b)=> +new Date(b.res[0].date) - +new Date(a.res[0].date));
    
    console.log("makeData==>",makeData)


    // 处理数据的同时完成顶部数据的统计
    topData.last = topData.totalIn - topData.totalOut;

    topData.last /= 100;
    topData.totalIn /= 100;
    topData.totalOut /= 100;

    // 设置顶部数据
    this.setData({
      topData
    })
    

    return makeData;


  },

  // 转换成几月几日 星期几
  formatDate(str){
    let time = new Date(str);

    let m = time.getMonth() + 1;

    let d = time.getDate();

    let w = time.getDay()

    let obj = {
      '0':'日',
      '1':'一',
      '2':'二',
      '3':'三',
      '4':'四',
      '5':'五',
      '6':'六',
    }

    return `${this.addZero(m)}月${this.addZero(d)}日 星期${obj[w]}`

  }

})