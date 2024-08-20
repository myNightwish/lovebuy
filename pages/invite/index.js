// pages/invite/invite.js
Page({
  onLoad: function (options) {
    const pendingFamilyId = options.pendingFamilyId;
    const openid = wx.getStorageSync('user').openid;

    wx.cloud.callFunction({
      name: 'handleInvite',
      data: {
        pendingFamilyId,
        openid
      },
      success: response => {
        if (response.result.success) {
          wx.showToast({ title: '加入家庭成功' });
          // 进一步操作，例如跳转到家庭主页
        } else {
          wx.showToast({ title: response.result.message, icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '加入失败', icon: 'none' })
    });
  }
});
