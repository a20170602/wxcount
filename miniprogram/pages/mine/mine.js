// miniprogram/pages/mine/mine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{

    },
    isAuth:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // app.editTabbar();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    // 查询一下是否有了userinfo
    wx.getSetting({
      success:(res)=>{
        console.log('res',res.authSetting["scope.userInfo"])
        if (res.authSetting["scope.userInfo"]) {   
          let isAuth = true;
          this.setData({
            isAuth
          }) 
          

          wx.getUserInfo({
            success: (res)=> {
              let userInfo = res.userInfo;
              console.log(userInfo)
              // 设置数据
              this.setData({
                userInfo
              })
            }
          })
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    let userInfo = e.detail.userInfo;

    // 设置数据
    this.setData({
      userInfo
    })

  },
  toMyBill(){
    console.log('aaa')
    wx.navigateTo({
      url: '../showBill/showBill'
    })

  }

})