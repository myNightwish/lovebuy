// cloudfunctions/getUserFamilyId/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
     // 登录获取 openid 和 session_key
     const wxContext = cloud.getWXContext();
     const openid = wxContext.OPENID;

  try {
    const user = await db.collection('users').where({ _openid: openid }).get();
    if (user.data.length > 0) {
      return { success: true, familyId: user.data[0].familyId };
    } else {
      return { success: false, message: '用户未找到' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
