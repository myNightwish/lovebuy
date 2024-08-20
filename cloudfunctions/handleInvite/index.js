// cloudfunctions/handleInvite/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { pendingFamilyId, openid } = event;

  try {
    // 获取待处理的家庭记录
    const familyRes = await db.collection('families').doc(pendingFamilyId).get();

    if (!familyRes.data) {
      return { success: false, message: '家庭记录不存在' };
    }

    // 更新家庭成员
    await db.collection('families').doc(pendingFamilyId).update({
      data: {
        members: db.command.push([openid]),
        updatedAt: new Date()
      }
    });

    // 更新用户记录
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        familyId: pendingFamilyId,
        updatedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
