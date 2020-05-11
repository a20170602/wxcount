
// echart
import * as echarts from '../../ec-canvas/echarts';

const app = getApp();

// 初始化echart的函数
let chart = null;
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  let chartsData ={
    color:[],
    data:[]
  }

  chart.setOption(getOption(chartsData));
  return chart;
}
// 一个根据数据返回配置的函数
function getOption({color,data} = chartsData){
    //颜色是一个数组 

    // 需要传入的数据是对应的颜色和数据 color / data
      // 配置
  let option = {
    backgroundColor: "#ffffff",
    // 需要传入的数据是对应的颜色
    color,
    series: [{
      label: {
        normal: {
          fontSize: 14
        },
        alignTo:'labelLine'
      },
      hoverAnimation:false,
      // 初始角度
      startAngle:0,
      // 动画重新沿着圆弧展开
      animationTypeUpdate:'expansion',
      // 动画时间
      animationDuration:function(idx){
        return idx * 1000
      },
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['40%', '60%'],
      data
    }]
  };

  return option;

}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化图表
    ec: {
      onInit: initChart
    },
    // 0代表年 1代表月份 2代表日 默认月
    type:1,
    // 这个是一个具有关系的全部date列表
    allDateList:{},
    // 根据已有的时间设置
    // 日期列表
    dateList:{
      // 年
      year:[],
      // 月
      month:[],
      // 日
      day:[]
    },

    // 当前选择的是最新的记录
    selDate:{
      year:'',
      month:'',
      day:''
    },

    // 一个映射
    typeToEle:{
      '0':'year',
      '1':'month',
      '2':'day'
    },
    // 默认支出
    costType:'zhichu',

    // 总支出
    totalZhi:0,

    // 总收入
    totalShou:0,

    // 根据时间请求的数据
    timeOfData:[],

    // 筛选之后的数据
    typeOfData:[],

    // 构造颜色和类别的映射
    typeToColor:{
      "餐饮":"#FF6766",
      "购物":"#FFAC66",
      "出行":"#6F66FF",
      "健康":"#7FDF64",
      "娱乐":"#67BCFF",
      "住房":"#FE8081",
      "人情":"#9D98FC",
      "交通":"#FF9A66",
      "学习":"#EFBB78",
      "其他":"#81DBFE",
    },

    // 列表渲染
    listData:[],
    // 是否完全没有数据
    noData:false,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (e) {

    // 获取账单的全部数据
    this.getAllBill();

  },

  // 切换年月日
  changeType(){
    let type = this.data.type;

    if(type == 2){
      type = 0;
    }else{
      type += 1;
    }

    this.setData({
      type
    })

    this.getDateByType();

  },

  // 获取所有账单
  getAllBill(){

    wx.showLoading({
      title: '加载中',
    })
    
    // 调用云函数
     wx.cloud.callFunction({
          name: 'bill_keep_getAll',
          success: res => {
            // wx.hideLoading()

            // this.showMsg("加载成功");
            console.log('[云函数] [bill_keep_getAll]: ', res)

            if(res.result.data.length == 0){
              let noData = true

              // 没有数据
              this.setData({
                noData
              })
            }else{
              // 根据请求回来的数据初始化
              this.initData(res.result.data);
            }

          },
          fail: err => {
            wx.hideLoading()
            this.showMsg("加载失败");
            console.error('[云函数] [bill_keep_getAll] 调用失败', err)
          }
    })

  },

  // 根据请求回来的数据，初始化
  initData(data){
    console.log("请求回来的数据==>",data);

    let dateArr = [];
    data.forEach(v => dateArr.push(v.date));
    // 去初始化列表把少年
    this.initAllDateList(dateArr);

    // 去初始化最开始的时间
    this.init();

    // 根据时间和类型去请求数据
    this.getDateByType();

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

  // 初始化一个时间列表
  initAllDateList(array){

    // 数据结构
    /*
      [
        {'2020':[
          {
            '01':[]
          },{
            '02':[]
          }
        ]},
        {'2019':[
          {
            '01':[]
          },{
            '02':[]
          }
        ]}
      ]
    
    */
    let allDateList = {};
    let o = {};
    
    for(let i = 0; i < array.length ; i++){
      // 根据-切割
      let res = array[i].split('-');
      if(o[res[0]] == undefined){
        o[res[0]] = [array[i]];
      }else{
        o[res[0]].push(array[i]);
      }
    }
    // 继续分割
    for(let key in o){
      let out = [];
      let ele = o[key];
      let len = ele.length;
      let t = {};
      for(let i = 0 ; i < len ; i++){
        let res = ele[i].split('-');
        if(t[res[1]] == undefined){
          t[res[1]] = [res[2]];
        }else{
          if(!t[res[1]].includes(res[2])){
            t[res[1]].push(res[2]);

          }
        }
      }
      console.log(t)
      for(let k in t){
        t[k].sort((a,b)=> +a - +b)

        out.push({'day':t[k],'month':k});
      }
      o[key] = out.sort((a,b)=>{ 
          return +a.month - +b.month
      });
    }

    allDateList = o;



    console.log("allDateList==>",allDateList)

    this.setData({
      allDateList
    })

  },

  // 初始化时间和展示列表
  init(){

    let allDateList = this.data.allDateList;

    // 年份
    let year = [];

    for(let k in allDateList){
      year.push(k);
    }

    year.sort((a,b) => +a - +b);

    // 月数组
    let m = allDateList[year[year.length - 1]];

    let month = [];

    for(let i = 0; i < m.length ; i++){
      month.push(m[i].month);
    }

    let day = m[m.length -1].day;

    // 最新时间对应的列表
    let dateList = {
      year,
      month,
      day
    };

    // 最新的一个时间
    let selDate = {
      year:year[year.length - 1],
      month:month[month.length - 1],
      day:day[day.length - 1],
    };

    this.setData({
      selDate,
      dateList
    })


  },

  // 根据当前事件数据改变列表
  changeDateList(type){
    // type 0 是改年份 1是改月份
    let dateList = this.data.dateList;

    let year = dateList.year;

    let selDate = this.data.selDate;
    let y = selDate.year;

    let allDateList = this.data.allDateList;

    console.log("allDateList",allDateList)
    console.log("selDate",selDate)

    let month = [];
    let day = [];

    for(let i = 0; i < allDateList[y].length;i++){
      month.push(allDateList[y][i].month);

      if(type == 1){//只有修改的是月份时候，选中的月份才有用
        if(selDate.month == allDateList[y][i].month){
          day =  allDateList[y][i].day;
          // 默认选择第一天
          selDate.day = day[0];
        }
      }else{//修改年份时候，默认选中一个月和其月的第一天
        if(i == 0){
          day =  allDateList[y][i].day;
          selDate.month = allDateList[y][i].month;
          // 默认选择第一天
          selDate.day = day[0];

        }

      }

    }

    dateList ={
      year,
      month,
      day
    }

    console.log('new==>',dateList)

    // 更新列表
    this.setData({
      dateList,
      selDate
    })

  },

  // 改变时间事件
  changeDate(e){
    let obj = e.currentTarget.dataset;
    let type = obj.type;
    let value = obj.value;
    let typeToEle = this.data.typeToEle;
    let selDate = this.data.selDate;

    if(selDate[typeToEle[type]] == value){
      this.showMsg("请勿重新点击");
      return;
    }

    selDate[typeToEle[type]] = value;
    if(type != 2){
          // 改变日期列表
      this.changeDateList(type);
    }


    this.setData({
      selDate
    })

    this.getDateByType();


  },

  // 构造请求参数
  makeGetData(){
    let type = this.data.type;
    let year = this.data.selDate.year;
    let month = this.data.selDate.month;
    let day = this.data.selDate.day;
    let start = null;
    let end = null;
    if(type == 0){
      // 年 2010-01-01 - 2011-01-01
      start = `${year}-01-01`;
      end = `${+year+1}-01-01`
    }else if(type == 1){//月
      start = `${year}-${month}-01`
      end = `${year}-${this.addZero(+month+1)}-01`
    }else{
      start = `${year}-${month}-${day}`
      end = `${year}-${month}-${this.addZero(+day+1)}`
    }

    return {
      start,
      end
    }

  },

  addZero(num){
    return num >= 10 ?  num : '0'+num;
  },

  // 根据当前类别和时间去获取数据
  getDateByType(type=true){
    // type true 默认请求 type false不请求
    // 1.构造请求参数
    // 年/月/日
    if(type){
      let data = this.makeGetData();
      console.log('请求data==>',data)
      // 发起请求
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
            let timeOfData = res.result.data;

            this.setData({
              timeOfData
            })
            
                // 根据当前支出/收入类型等进行筛选
              this.makeTypeOfData();


            // 弄完饼图还要弄下面的进度条
            this.makeProgressData();
  
            // 处理饼图数据的同时，处理一下该显示的数据
            this.makePieData();
          },
          fail: err => {
            wx.hideLoading();
            this.showMsg("加载失败");
            console.error('[bill_keep_get]  调用失败', err)
        }
      })

    }else{
      // 根据当前支出/收入类型等进行筛选
      this.makeTypeOfData();
      // 不请求
      this.makePieData();
      // 配置


      // 弄完饼图还要弄下面的进度条
      this.makeProgressData();
    }




  },

  changeCostType(e){
    // 改变支付状态
    let costType =  e.currentTarget.dataset.type;

    if(costType == this.data.costType){
      this.showMsg("请勿重复点击");
      return;
    }

    // 刷新数据
    this.setData({
      costType
    })

    this.getDateByType(false);


  },
   // 展示信息
  showMsg(msg){
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1000,
      mask:true
    })
  },
  // 弄饼图
  makePieData(){


    let newRes = this.data.typeOfData;

    let data = [];

    let name = [];

    let color = [];
    for(let i = 0; i < newRes.length ; i++){
        if(!name.includes(newRes[i].dec)){
          name.push(newRes[i].dec);
        }
    }
 
    for(let j = 0; j < name.length; j++){
      let o ={};
      o.name = name[j];
      color.push(this.data.typeToColor[o.name]);
      o.value = 0;
      for(let k = 0; k < newRes.length; k++){
        if(o.name == newRes[k].dec){
          o.value += +newRes[k].money;
        }
      }

      // 在这里加一个自定义数据
      let total = 0;
      if(this.data.costType == "zhichu"){
         total = this.data.totalZhi;
      }else{
         total = this.data.totalShou;
      }
      console.log(total)
      let value = o.value / total;

      value = (value* 100).toFixed(2);

      o.name = `${o.name} ${value}%`
      

      // o.data = 0;

      data.push(o);
    }

    console.log('data==>',data);
    console.log('color==>',color);

    this.newPie({data,color});
    
  },

  // 创建饼图实例
  newPie(chartsData){
    // 获取配置并更新
    chart.setOption(getOption(chartsData));
  },

  // 根据时间数据去筛选条件返回实际渲染数据
  makeTypeOfData(){
    let res = this.data.timeOfData;
    let totalZhi = 0;
    let totalShou = 0;

    let costType = this.data.costType;
    let typeOfData = [];
    for(let j = 0; j < res.length; j++){
      if(res[j].costType == 'zhichu'){
        totalZhi += res[j].money * 100;
      }else{
        totalShou += res[j].money * 100;
      }
      // 先分类支出或者收入
      if(res[j].costType == costType){
        typeOfData.push(res[j]);
      }
    }

    totalShou /= 100;
    totalZhi /= 100;
    this.setData({
      totalZhi,
      totalShou,
      typeOfData
    })
  },

  // 做进度条数据
  makeProgressData(){
    // 根据当前渲染数据来弄
    let data = this.data.typeOfData;

    console.log("data==>",data)
    /*需要构造的数据结构
    // 因为第一需要排上面，所以是数组
      [ 
        {
          dec:"饮食",
          res:[],
          total:总金额
          precent:精度条百分比(取整数)
        }
      ]
    */ 
      let output = [];
      let tag = [];//先记录类型
      for(let i = 0; i < data.length; i++){
        if(!tag.includes(data[i].dec)){
          tag.push(data[i].dec)
        }
      }

      let max = 0;
      for(let j = 0; j < tag.length ; j++){
        let o = {};
        o.dec = tag[j];
        o.activeColor = this.data.typeToColor[o.dec];
        o.total = 0;
        o.ids = '-';
        o.count= 0;
        for(let k = 0; k < data.length ; k++){
          if(tag[j] == data[k].dec){
            if( o.icon_url == undefined){
              o.icon_url = data[k].icon_url;
            }

            o.count++;
            // 拿到ids
            o.ids +=  data[k]._id + '-';

            o.total += data[k].money * 100;
          }
        }
        max = max > o.total ? max : +o.total;
        o.total /= 100;
        o.ids = JSON.stringify(o.ids);
        output.push(o)
      }

      output.forEach(v =>{
        v.percent = Math.round(((v.total * 100) / max)*100)
      })

      output.sort((a,b) => b.total - a.total);

      // console.log(output)  
      // 先设置一个persent为0的

      let beforeOutPut = JSON.parse(JSON.stringify(output));
      beforeOutPut.forEach(v => v.percent = 0);

      console.log("output==>",output)

      this.setData({
        listData:beforeOutPut
      })

      this.setData({
        listData:output
      })
  },


  // 去详情页
  toDetail(e){
    // 拿到参数，跳转页面
    let ids = e.currentTarget.dataset.str;
    console.log(ids)
    wx.navigateTo({
      url: '../detail/detail?ids='+ids,
    })


    
  }



})