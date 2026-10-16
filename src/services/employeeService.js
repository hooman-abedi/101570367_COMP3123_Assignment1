const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// 404 if it doesn't exist, 403 if it belongs to someone else
async function ensureOwned(eid, userId) {
  const emp = await Employee.findById(eid);
  if (!emp) throw new AppError('Employee not found', 404);
  if (emp.user.toString() !== userId) {
    logger.warn(`Authorization failure: user ${userId} tried to access employee ${eid}`);
    throw new AppError('You do not have permission to access this employee', 403);
  }
  return emp;
}

exports.list = (userId) => Employee.find({ user: userId }).sort({ created_at: -1 });
exports.create = (userId, data) => Employee.create({ ...data, user: userId }); // owner from token
exports.getOne = (userId, eid) => ensureOwned(eid, userId);

exports.update = async (userId, eid, data) => {
  await ensureOwned(eid, userId);
  delete data.user;
  return Employee.findOneAndUpdate({ _id: eid, user: userId }, data, { new: true, runValidators: true });
};

exports.remove = async (userId, eid) => {
  await ensureOwned(eid, userId);
  await Employee.deleteOne({ _id: eid, user: userId });
};