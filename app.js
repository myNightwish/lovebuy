// app.js
App({
  // 小程序每次启动的时候都会执行
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init({
      env: "lovefamilybuy-2g7oatm42272550a",
      traceUser: true
    });
  },
  globalData: {
    userInfo: null
  }
})
