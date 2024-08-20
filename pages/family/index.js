// pages/family/family.js
Page({
  data: {
    familyName: '',
    inviteLink: ''
  },

  createFamily: function() {
    const user = wx.getStorageSync('user');
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.cloud.callFunction({
      name: 'createFamily',
      data: {
        familyName: this.data.familyName,
        creator: wx.getStorageSync('user').openid
      },
      success: response => {
        if (response.result.success) {
          this.setData({
            inviteLink: response.result.inviteLink
          });
          wx.showToast({ title: '家庭创建成功，邀请链接已生成' });
        } else {
          wx.showToast({ title: '创建失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '创建失败', icon: 'none' })
    });
  },

  onShareAppMessage: function() {
    return {
      title: '邀请您加入家庭',
      path: this.data.inviteLink
    };
  }
});
