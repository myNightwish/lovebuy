// 云函数: updateOrderInfo
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const { familyId, orders, updatedBy } = event;

  try {
    // 遍历 orders 数组，逐一更新数据库中的订单信息
    await Promise.all(orders.map(order => {
      // 将订单信息中需要更新的字段解构出来，排除 `_id` 字段
      const { _id, ...updateData } = order;

      return db.collection('orders').where({
        _id: _id,  // 使用 order._id 作为查询条件
        familyId
      }).update({
        data: {
          ...updateData,  // 只更新非 _id 的字段
          updatedBy,
          updatedAt: new Date()
        }
      });
    }));

    return { success: true };
  } catch (error) {
    console.error('更新订单信息时出错:', error);
    return { success: false, error: error.message };
  }
};
