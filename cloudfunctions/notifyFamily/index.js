// 云函数: notifyFamilyMembers
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const { familyId, message } = event;

  try {
    // 获取家庭成员的 openid
    const familyMembers = await db.collection('users').where({ familyId }).get();

    const openids = familyMembers.data.map(user => user._openid);

    // 发送通知
    await Promise.all(openids.map(openid =>
      cloud.openapi.subscribeMessage.send({
        touser: openid,
        templateId: 'UwQNyW77M2U2JgpUEtFg1uNtPwLfhuB-oHkJfkqxWsM', // 替换为你的模板 ID
        page: 'pages/orders/index', // 通知点击后的跳转页面
        data: {
          time1: { value: message },
          thing2: { value: '点单系统' } // 自定义通知内容
        }
      })
    ));

    return { success: true };
  } catch (error) {
    console.error('发送通知时出错:', error);
    return { success: false, error: error.message };
  }
};
