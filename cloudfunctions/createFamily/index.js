// cloudfunctions/createFamily/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { familyName, creator } = event;

  try {
    // 登录获取 openid 和 session_key
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    // 创建家庭记录
    const familyRes = await db.collection('families').add({
      data: {
        familyName,
        members: [creator], // 初始成员是创建者
        createdAt: new Date(),
      },
    });

    // 获取创建的家庭 ID
    const familyId = familyRes._id;

    // 生成邀请链接
    const inviteLink = `/pages/invite/invite?pendingFamilyId=${familyId}`;
    // 更新创建家庭用户的 familyId
    const updateRes = await db.collection('users').where({
        _openid: openid
      }).update({
        data: {
          familyId,
          updatedAt: new Date()
        }
      });

      if (updateRes.stats.updated === 0) {
        return { success: false, message: '用户信息更新失败' };
      }
    return {
      success: true,
      familyId,
      inviteLink
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
