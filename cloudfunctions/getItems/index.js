// cloudfunctions/getItems/index.js
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { familyId } = event;

  try {
    const items = await db.collection('items').where({ familyId }).get();
    return { success: true, data: items.data };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
