// cloudfunctions/updateItem/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { itemId, updates } = event;

  try {
    const res = await db.collection('items').doc(itemId).update({
      data: updates
    });
    return { success: true, updated: res.stats.updated };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
