Page({
  data: {
    itemName: '',
    itemCount: 1,
    itemDescription: '',
    buyInfos: [],
    familyId: null,
    images: []
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
        } else {
          wx.showToast({ title: '请加入家庭', icon: 'none' });
        }
      } else {
        wx.showToast({ title: '获取家庭信息失败', icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '获取家庭信息失败', icon: 'none' });
    }
  },
  handleUpdate(e) {
    // 更新父组件的数据
    this.setData({
      buyInfos: e.detail.data
    });
  },
  deleteImg() {
    this.setData({
      images: []
    });
  },
  // 上传图片处理
  afterRead(event) {
    const { file } = event.detail;
    const that = this;
    wx.cloud.uploadFile({
      cloudPath: `uploadImages/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`, // 上传至云存储的路径
      filePath: file.tempFilePath, // 小程序临时文件路径
      success: res => {
        // 上传成功后，将文件信息添加到 images
        that.setData({
          images: [].concat({url: res.fileID,  deletable: true, isImage: true,}),
        });
      },
      fail: err => {
        wx.showToast({
          title: '上传失败啦',
          icon: 'none',
        });
      },
    });
  },
  resetForm() {
    this.setData({
      itemName: '',
      itemCount: 1,
      itemDescription: '',
      images: []
    })
  },
  // 添加物品
  async addNewItem() {
    if (!this.data.itemName) {
      wx.showToast({ title: '物品名称不能为空', icon: 'none' });
      return;
    }
    this.data.buyInfos.push(
      {
        itemName: this.data.itemName,
        itemCount: this.data.itemCount,
        itemDescription: this.data.itemDescription,
        images: this.data.images,
        creator: wx.getStorageSync('openid'),
        familyId: this.data.familyId, // 使用获取到的 familyId
        uniqueId: Date.now()
      }
    )
    this.setData({
      buyInfos: [...this.data.buyInfos]
    })
    setTimeout(() => {
      this.resetForm();
    })
  },
  // 提交整个物品列表
  async submitItemList() {
    if (this.data.buyInfos.length === 0) {
      wx.showToast({ title: '提交物品是空的', icon: 'none' });
      return;
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'submitItemList', // 云函数名称
        data: {
          items: this.data.buyInfos,
          familyId: this.data.familyId, // 使用获取到的familyId
        }
      });

      if (res.result.success) {
        wx.showToast({ title: '提交成功' });
        this.clearItems();
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
      buyInfos: []
    });
  },
});
