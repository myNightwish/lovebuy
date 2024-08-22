Page({
  data: {
    activeTab: 'buyInfos', // 默认展示采购信息
    buyInfos: [], // 采购信息列表
    orders: [], // 点餐信息列表
    familyId: '',
    goods: [
      '待采购', '点菜'
    ]
  },
  onLoad() {
    this.loadItems();
  },
  handleUpdate(e) {
    // 更新父组件的数据
    this.setData({
      buyInfos: e.detail.data
    });
  },
  // 切换 Tab
  onTabChange(event) {
    this.setData({
      activeTab: event.detail.name,
    });
  },

  // 加载采购信息
  async loadItems() {
    this.setData({ loading: true });
    try {
      const user = wx.getStorageSync('user');
      const openid = user.openid;
      if (!openid) {
        wx.showToast({ title: '请登录', icon: 'none' });
        return;
      }

      const res = await wx.cloud.callFunction({
        name: 'getUserFamilyId',
        data: { openid }
      });

      if (res.result.success) {
        const familyId = res.result.familyId;
        if (familyId) {
          this.setData({ familyId });
        } else {
          wx.showToast({ title: '请加入家庭', icon: 'none' });
        }
      } else {
        wx.showToast({ title: '获取家庭信息失败', icon: 'none' });
      }
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '获取家庭信息失败', icon: 'none' });
    }
    console.log('this.data.familyId', this.data.familyId)
    try {
      const res = await wx.cloud.callFunction({
        name: 'getItems',
        data: { familyId: this.data.familyId }
      });
      console.log('res.result.data', res.result.data)
      if (res.result.success) {
        this.setData({
          buyInfos: res.result.data,
          finished: res.result.data.length === 0
        });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  // 提交订单信息
  async submitOrder() {
    try {
        const user = wx.getStorageSync('user');
        const openid = user.openid;
        console.log('ss', JSON.stringify({
          familyId: this.data.familyId, // 当前家庭 ID
          orders: this.data.buyInfos, // 提交的订单信息
          updatedBy: openid // 更新者的 openid
        }))

      // 提交订单信息到数据库
      const res = await wx.cloud.callFunction({
        name: 'submitItemList', // 云函数名称
          data: {
            items: this.data.buyInfos,
            familyId: this.data.familyId, // 使用获取到的familyId
            updatedBy: openid // 更新者的 openid
          }
      });
      if (res.result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        // 通知家庭成员
        await wx.cloud.callFunction({
          name: 'notifyFamily',
          data: {
            familyId: this.data.familyId,
            message: '订单信息已更新',
          }
        });
        
        wx.showToast({
          title: '通知已发送',
          icon: 'success'
        });

      } else {
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('提交订单时出错:', error);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    }
  },
});
