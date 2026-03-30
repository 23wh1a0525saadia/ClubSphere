const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

exports.getSummaryStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalClubs, totalEvents, totalRegistrations, uniqueClubMembers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Club.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
      Club.aggregate([
        { $unwind: { path: '$members', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$members' } },
        { $count: 'count' }
      ])
    ]);

    const totalClubMembers = uniqueClubMembers[0]?.count || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalClubMembers,
        totalClubs,
        totalEvents,
        totalRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};
