const { matchedData } = require('express-validator');
const svc = require('../services/employeeService');
const logger = require('../utils/logger');

exports.list = async (req, res, next) => {
  try { res.status(200).json(await svc.list(req.user.id)); } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const emp = await svc.create(req.user.id, matchedData(req, { locations: ['body'] }));
    logger.info(`Employee created ${emp._id} by user ${req.user.id}`);
    res.status(201).json({ message: 'Employee created successfully', employee_id: emp._id, employee: emp });
  } catch (e) { next(e); }
};

exports.getOne = async (req, res, next) => {
  try { res.status(200).json(await svc.getOne(req.user.id, req.params.eid)); } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const emp = await svc.update(req.user.id, req.params.eid, matchedData(req, { locations: ['body'] }));
    logger.info(`Employee updated ${emp._id} by user ${req.user.id}`);
    res.status(200).json({ message: 'Employee details updated successfully', employee: emp });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await svc.remove(req.user.id, req.query.eid);
    logger.info(`Employee deleted ${req.query.eid} by user ${req.user.id}`);
    res.status(204).send(); // 204 = success, no body
  } catch (e) { next(e); }
};