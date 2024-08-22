Component({
  data: {
    selected: 0,
    color: "#515151",
    selectedColor: "#6a6da9",
    list: [
      {
        "pagePath": "pages/orders/index",
        "text": "首页",
        "iconPath": "/assets/home.png",
        "selectedIconPath": "/assets/home_active.png"
      },
      {
        "pagePath": "pages/items/index",
        "text": "上传",
        "iconPath": "/assets/search.png",
        "selectedIconPath": "/assets/search_active.png"
      },
      {
        "pagePath": "pages/family/index",
        "text": "我的",
        "iconPath": "/assets/users.png",
        "selectedIconPath": "/assets/users_active.png"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      console.log('path--', path)

      // 判断是否需要切换 tab，防止重复点击同一 tab
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
});
