// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 登录获取 openid 和 session_key
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get();

    if (userRes.data.length > 0) {
      // 如果用户存在，返回用户信息
      const user = userRes.data[0];
      return {
        success: true,
        user: {
          openid,
          familyId: user.familyId || null,
          // 其他用户信息
        }
      };
    } else {
      // 如果用户不存在，创建新用户记录
      const newUser = {
        _openid: openid,
        createdAt: new Date(),
        familyId: null, // 初始化时设置为 null
        // 其他默认用户信息
      };

      await db.collection('users').add({
        data: newUser
      });

      return {
        success: true,
        user: {
          openid,
          familyId: null,
          // 其他用户信息
        }
      };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
