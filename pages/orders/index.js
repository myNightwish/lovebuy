Page({
  data: {
    activeTab: 'buyInfos', // 默认展示采购信息
    buyInfos: [], // 采购信息列表
    orders: [], // 点餐信息列表
    currentOrder: {
      orderName: '',
      remark: '',
      images: [],
    },
    familyId: '',
    goods: [
      '采购', '点菜'
    ]
  },
    // 增加数量
    increaseCount(event) {
      const id = event.currentTarget.dataset.id;
      const updatedBuyInfos = this.data.buyInfos.map(item => {
        if (item._id === id) {
          return {
            ...item,
            itemCount: +item.itemCount + 1,
          };
        }
        return item;
      });
      this.setData({
        buyInfos: updatedBuyInfos,
      });
    },
  
 // 减少数量
 decreaseCount(event) {
  const id = event.currentTarget.dataset.id;
  const updatedBuyInfos = this.data.buyInfos.map(item => {
    if (item._id === id) {
      return {
        ...item,
        itemCount: Math.max(+item.itemCount - 1, 1), // 防止数量小于0
      };
    }
    return item;
  });
  this.setData({
    buyInfos: updatedBuyInfos,
  });
},
  onLoad() {
    this.loadItems();
    // this.loadOrders();
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
          // this.loadItems(); // 如果 familyId 存在，则加载物品列表
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

  // 加载点餐信息
  async loadOrders() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getOrders',
        data: {
          familyId: wx.getStorageSync('familyId'),
        },
      });

      this.setData({
        orders: res.result.orders,
      });
    } catch (error) {
      console.error(error);
    }
  },

  // 编辑订单
  editOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o._id === orderId);
    this.setData({
      currentOrder: order,
    });
  },

  // 处理图片上传后的结果
  onAfterRead(event) {
    const { file } = event.detail;
    this.setData({
      'currentOrder.images': [...this.data.currentOrder.images, file.url],
    });
  },

  // 提交订单更新
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
  // 标记为已购买
  async markAsPurchased(event) {
    const itemId = event.currentTarget.dataset.id;

    try {
      const res = await wx.cloud.callFunction({
        name: 'markItemAsPurchased',
        data: {
          itemId,
        },
      });

      if (res.result.success) {
        wx.showToast({ title: '标记成功' });
        this.loadItems(); // 刷新采购信息列表
        // 通知其他成员
        await wx.cloud.callFunction({
          name: 'notifyFamily',
          data: {
            message: '采购信息已更新',
          },
        });
      } else {
        wx.showToast({ title: '标记失败', icon: 'none' });
      }
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '标记失败', icon: 'none' });
    }
  },
});
