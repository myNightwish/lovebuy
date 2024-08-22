// components/productItem.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    buyInfos: {
      type: Array,
      value: () => []
    },
    showDelete: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
      // 删除物品
      async deleteItem(event) {
        const index = event.currentTarget.dataset.index;
        const updatedBuyInfos = [...this.data.buyInfos];
        updatedBuyInfos.splice(index, 1); // 删除指定索引的物品
        this.triggerEvent('update', { data: updatedBuyInfos });
        wx.showToast({ title: '物品已删除' });
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
        this.triggerEvent('update', { data: updatedBuyInfos });
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
        this.triggerEvent('update', { data: updatedBuyInfos });
      },
  }
})
