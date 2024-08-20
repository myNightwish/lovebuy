Page({
  data: {
    isLoggedIn: false,
    userInfo: {}
  },

  onLoad: function() {
    this.checkLoginStatus();
  },

  handleLogin: function() {
    wx.cloud.callFunction({
      name: 'loginin',
      data: {},
      success: response => {
        console.log('response.result.success',response.result)
        if (response.result.success) {
          wx.setStorageSync('user', response.result.user);
          this.setData({
            isLoggedIn: true,
            userInfo: response.result.user
          });
          wx.showToast({ title: '登录成功' });
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  },

  navigateTo: function(event) {
    const page = event.currentTarget.dataset.page;
    wx.navigateTo({ url: `/pages/${page}/index` });
  },

  checkLoginStatus: function() {
    const user = wx.getStorageSync('user');
    if (user) {
      this.setData({
        isLoggedIn: true,
        userInfo: user
      });
    }
  }
});
