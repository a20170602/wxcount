// miniprogram/pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // bill_type 每八个一个数组
    bill_type:[],


    // 轮播图配置
    swiperOptions:{
      indicatorDots:true,
      indicatorColor:"rgba(85,172,255,.3)",
      indicatorActiveColor:"rgba(85,172,255,1)"
    },

    // tab标签
    tab:[
      {
        title:"支出",
        type:"zhichu",
        isAct:true
      },
      {
        title:"收入",
        type:"shouru",
        isAct:false
      }
    ],

    // 账户选择
    bill:[
      {
        text:'现金',
        type:'xianjing',
        isAct:true
      },
      {
        text:'微信钱包',
        type:'wechat',
        isAct:false
      },
      {
        text:'支付宝',
        type:'zhifubao',
        isAct:false
      },
      {
        text:'储蓄卡',
        type:'cashcard',
        isAct:false
      },
      {
        text:'信用卡',
        type:"creditcard",
        isAct:false
      },
    ],

    // inputInfo 输入的信息
    inputInfo:{

      cost:"支出",
      // 类型(默认支出)
      costType:'zhichu',

      // 账户
      account:"现金",
      accountType:"xianjing",

      // 支出或收入类型
      dec:'',
      icon_url:'',
      type:'',
      _id:'',

      // 最后的输入
      date:'',
      money:'',
      detail:''
    },

    date:'',
    // initData
    start:'',
    end:'',

    // 是否授权
    isAuth:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 初始化页面标签
    this.initBillType();


    // 初始化各项数据
    this.initData();

     // 查询一下是否有了userinfo
    wx.getSetting({
      success:(res)=>{
        console.log('res',res.authSetting["scope.userInfo"])
        if (res.authSetting["scope.userInfo"]) {   
          let isAuth = true;
          this.setData({
            isAuth
          }) 
        
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  // 标签切换
  taggleTap(e){
    let index = e.target.dataset.index;
    console.log('index==>',index)

    let tab =  this.data.tab;

    if(tab[index].isAct){
      return;
    }

    for(let i = 0; i < tab.length ; i++){
      tab[i].isAct = false;
    }
    tab[index].isAct = true;
    this.data.inputInfo.cost = tab[index].title;
    this.data.inputInfo.costType = tab[index].type;

    this.setData({
      tab
    })



  },

  // 账单切换
  taggleBill(e){
    let index = e.target.dataset.index;
    let bill = this.data.bill;

    if(bill[index].isAct){
      return;
    }

    for(let i = 0; i < bill.length ; i++){
      if(bill[i].isAct){
        bill[i].isAct = false;
        break;
      }
    }
    bill[index].isAct = true;
    // 保存数据
    this.data.inputInfo.account = bill[index].text;
    this.data.inputInfo.accountType = bill[index].type;


    this.setData({
      bill
    })

  },

  // 选择时间事件
  selDate(e){
    // let date = e
    console.log('e==>',e)

    let date = e.detail.value;

    this.data.inputInfo.date = date;

    this.setData({
      date
    })

  },


  // 标签选择
  taggleBillType(e){
    console.log("标签选择",e)

    let i = e.currentTarget.dataset.i;

    let index = e.currentTarget.dataset.index;

    let bill_type = this.data.bill_type;

    console.log("bill_type",bill_type)
    console.log('i',i)
    console.log('index',index)

    let keys = ['dec','icon_url','_id','type'];

    if(bill_type[index][i].isAct){
      bill_type[index][i].isAct = false

      // 需要删除数据
      for(let i = 0; i < keys.length ; i++){
        this.data.inputInfo[keys[i]]  = '';
      }

    }else{

      // 找到激活的打断
      for(let j = 0; j < bill_type.length ; j++){
        for(let k = 0; k < bill_type[j].length; k++){
          if(bill_type[j][k].isAct){
            bill_type[j][k].isAct = false;
            break
          }
        }
      }

      bill_type[index][i].isAct = true;

      // 添加数据
      for(let l = 0; l < keys.length ; l++){
        this.data.inputInfo[keys[l]] =  bill_type[index][i][keys[l]];
      }

    }


    this.setData({
      bill_type
    })

    console.log(bill_type)



  },

  // 初始化页面标签
  initBillType(){
     // 调用加载
     wx.showLoading({
      title: '加载中',
    })

    // 调用云函数
    wx.cloud.callFunction({
      name: 'bill_type',
      data: {},
      // 调用成功
      success: res => {
        console.log('[bill_type]==>', res)
        wx.hideLoading();
        let data = res.result.data;
        
        // 构造好数组 , 加上isAct属性
        data.forEach(v =>{
          v.isAct = false;
        })

        let bill_type = [];
        let bagin = 0;
        while(bagin < data.length){
          let tmp = data.slice(bagin,bagin+8);
          bagin += 8;
          bill_type.push(tmp)
        }

        console.log("bill_type==>",bill_type)

        this.setData({
          bill_type
        })
        


      },
      // 调用失败
      fail: err => {
        wx.hideLoading();
        console.error('[bill_type]调用失败==>', err)
      }
    })
  },

  // 初始化各项数据
  initData(){
    // 这个方法不想，我的手机不能弄
    let date = this.makeDate();
    // 获取
    let inputInfo = this.data.inputInfo;
    let timeArr = date.split('-');
    inputInfo.money = '';
    inputInfo.detail = '';
    inputInfo.date = date;
    inputInfo._id = '';
    let end = timeArr.join('-');
    timeArr[0] = timeArr[0] - 1;
    let start = timeArr.join('-');
    this.setData({
      start,
      end,
      date,
      inputInfo
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

  onGotUserInfo(e){
    let msg = e.detail.errMsg;
    if(msg == 'getUserInfo:fail auth deny'){
      return;
    }
  },

  // 保存账单
  saveBill(){
    // 验证一下是否已经获取后台其信息，再决定是否下去
    

    // 我需要验证 小类 金额 说明 3个
    let sendData = this.data.inputInfo;
    console.log("sendData==>",sendData)

    if(sendData._id == ''){
      this.showMsg("请选择种类");
      return;
    }else if(sendData.money == ""){
      this.showMsg("请输入金额");
      return;
    }else if(sendData.detail == ""){
      this.showMsg('请输入说明');
      return;
    }else{
      this.showMsg('输入成功');

      // 上传数据
      this.UploadBill(sendData);


    }


  },

  // 表单输入事件
  inputEve(e){
    // 拿到值
    let value = e.detail.value;

    let type = e.currentTarget.dataset.type;

    // 给数据设置
    this.data.inputInfo[type] = value;

    console.log("this.data.inputInfo当前数据",this.data.inputInfo);

  },

  // 重置前端页面
  resetData(){
    // 重置数据
    this.initData();

    // 变回支出
    let tab = this.data.tab;
    tab[0].isAct = true;
    tab[1].isAct = false;

    // 把所有小类变回去
    let bill_type = this.data.bill_type;
    for(let i = 0; i < bill_type.length; i++){
      for(let j=0; j < bill_type[i].length; j++){
        if(bill_type[i][j].isAct){
          bill_type[i][j].isAct = false;
          break;
        }
      }
    }


    // 把账户选择变回去
    let bill = this.data.bill;
    for(let k = 0; k < bill.length ; k++){
      if(k == 0){
        bill[k].isAct = true;
      }else{
        bill[k].isAct = false;
      }
    }

    this.setData({
      tab,
      bill_type,
      bill
    })


    



  },

  // 上传数据
  UploadBill(sendData){

    // 正在上传
    wx.showLoading({
      title: '保存中',
    })

    // 把_id字段换一下，避免报错
    let data = {...sendData};

    data.myId = sendData._id;

    delete data._id;

    // 调用云函数
    wx.cloud.callFunction({
      name: 'bill_keep_add',
      data,
      success: res => {
        wx.hideLoading();
        this.showMsg("保存成功");

        // 成功重置
        this.resetData();
      },
      fail: err => {
        wx.hideLoading();
        this.showMsg("保存失败");
        // 调用失败
        console.log('[bill_keep_add]  调用失败', err)
      }
    })


  },

  // 轻提升
  showMsg(msg){
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000,
      mask:true
    })
  },

  onGotUserInfo(e){
    console.log('我调用来')
    console.log(e)
    let msg = e.detail.errMsg;
    if(msg == 'getUserInfo:fail auth deny'){
      return;
    }
    
    let isAuth = true;
    this.setData({
      isAuth
    }) 
  }


  
})