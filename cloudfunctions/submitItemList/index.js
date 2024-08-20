// 云函数: submitItemList
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { items, familyId } = event;

  try {
    const addResults = await Promise.all(items.map(item => {
      return db.collection('items').add({
        data: {
          ...item,
          familyId,
          createdAt: new Date(),
          updatedAt: new Date(),
          purchased: false
        }
      });
    }));

    return { success: true, addResults };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};
