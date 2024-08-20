// pages/items/items.js
Page({
  data: {
    itemName: '',
    itemCount: 1,
    itemDescription: '',
    images: [],
    items: [],
    loading: false,
    finished: false,
    familyId: null, // 初始化 familyId
    activeTab: 1,
    orders: [], // 本地点单列表
    newOrder: {
      orderName: '',
      quantity: 1,
    },
  },
   // 提交整个点单列表
   async submitOrderList() {
    if (this.data.orders.length === 0) {
      wx.showToast({ title: '没有需要提交的点单', icon: 'none' });
      return;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'submitOrderList',
        data: {
          orders: this.data.orders,
          familyId: this.data.familyId, // 使用获取到的familyId
        }
      });

      if (res.result.success) {
        wx.showToast({ title: '点单提交成功' });
        this.clearOrders(); // 提交成功后清空本地点单列表
        this.loadOrders(); // 重新加载点单列表
      } else {
        wx.showToast({ title: '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },
    // 清空本地点单列表
    clearOrders() {
      this.setData({
        orders: []
      });
    },
      // 加载历史点单
  async loadOrders() {
    // 从数据库加载该家庭的历史点单列表
  },
    // 添加点单到本地列表
    addOrderToLocalList() {
      const { orderName, quantity } = this.data.newOrder;
      console.log('this.data.newOrder-', this.data.newOrder)
      if (!orderName) {
        wx.showToast({ title: '菜品名称不能为空', icon: 'none' });
        return;
      }
  
      const newOrder = {
        orderName,
        quantity,
        creator: wx.getStorageSync('user').openid, // 从本地存储获取用户openid
      };
  
      this.setData({
        orders: [...this.data.orders, newOrder],
        newOrder: {
          orderName: '',
          quantity: 1,
        }
      });
  
      wx.showToast({ title: '点单已添加' });
    },
   // 切换tab
   onTabChange(event) {
    this.setData({
      activeTab: event.detail.index
    });
  },
  // 页面加载时获取 familyId
  async onLoad() {
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
  },

  // 上传图片处理
  afterRead(event) {
    const { file } = event.detail;
    this.setData({
      images: [...this.data.images, file.file.url]
    });
  },

  // 添加物品
  async addItem() {
    if (!this.data.itemName) {
      wx.showToast({ title: '物品名称不能为空', icon: 'none' });
      return;
    }
    this.data.items.push(
      {
        itemName: this.data.itemName,
        itemCount: this.data.itemCount,
        itemDescription: this.data.itemDescription,
        images: this.data.images,
        creator: wx.getStorageSync('openid'),
        familyId: this.data.familyId // 使用获取到的 familyId
      }
    )
    this.setData({
      items: [...this.data.items]
    })
  },

  // 重置表单
  resetForm() {
    this.setData({
      itemName: '',
      itemCount: 1,
      itemDescription: '',
      images: []
    });
  },

  // 加载物品列表
  async loadItems() {
    if (!this.data.familyId) return;

    this.setData({ loading: true });
    console.log('this.data.familyId', this.data.familyId)
    try {
      const res = await wx.cloud.callFunction({
        name: 'getItems',
        data: { familyId: this.data.familyId }
      });
      console.log('res.result.data', res.result.data)
      if (res.result.success) {
        this.setData({
          items: res.result.data,
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

  // 删除物品
  async deleteItem(event) {
    const itemId = event.currentTarget.dataset.id;
    const index = event.currentTarget.dataset.index;

    const updatedItems = [...this.data.items];
    updatedItems.splice(index, 1); // 删除指定索引的物品

    this.setData({
      items: updatedItems
    });
    wx.showToast({ title: '物品已删除' });
  },
  // 提交整个物品列表
  async submitItemList() {
    if (this.data.items.length === 0) {
      wx.showToast({ title: '没有需要提交的物品', icon: 'none' });
      return;
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'submitItemList', // 云函数名称
        data: {
          items: this.data.items,
          familyId: this.data.familyId, // 使用获取到的familyId
        }
      });

      if (res.result.success) {
        wx.showToast({ title: '物品列表提交成功' });
        this.clearItems(); // 提交成功后清空本地物品列表
        wx.navigateTo({ url: `/pages/order/index` });
      } else {
        wx.showToast({ title: '提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  // 清空本地物品列表
  clearItems() {
    this.setData({
      items: [] // 清空本地存储的物品列表
    });
  },
});
