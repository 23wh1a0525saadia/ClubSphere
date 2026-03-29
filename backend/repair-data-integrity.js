const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

dotenv.config({ path: path.join(__dirname, '.env') });

const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const repair = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, '_id');
    const userIdSet = new Set(users.map((u) => u._id.toString()));

    const clubs = await Club.find({});
    let clubsUpdated = 0;

    for (const club of clubs) {
      const currentMembers = Array.isArray(club.members) ? club.members.map(toIdString).filter(Boolean) : [];
      const validMembers = Array.from(new Set(currentMembers.filter((id) => userIdSet.has(id))));
      const presidentId = toIdString(club.president);

      if (presidentId && userIdSet.has(presidentId) && !validMembers.includes(presidentId)) {
        validMembers.push(presidentId);
      }

      const changedMembers = validMembers.length !== currentMembers.length || validMembers.some((id, i) => id !== currentMembers[i]);
      const changedCount = club.memberCount !== validMembers.length;

      if (changedMembers || changedCount) {
        club.members = validMembers;
        club.memberCount = validMembers.length;
        await club.save();
        clubsUpdated += 1;
      }
    }

    // Rebuild clubsJoined links from clubs.members
    await User.updateMany({}, { $set: { clubsJoined: [] } });
    const refreshedClubs = await Club.find({}, '_id members');

    for (const club of refreshedClubs) {
      const memberIds = (club.members || []).map(toIdString).filter(Boolean);
      if (memberIds.length > 0) {
        await User.updateMany(
          { _id: { $in: memberIds } },
          { $addToSet: { clubsJoined: club._id } }
        );
      }
    }

    const events = await Event.find({});
    let eventsUpdated = 0;

    for (const event of events) {
      const eventId = event._id.toString();
      const validRegs = await Registration.find({ event: event._id, student: { $exists: true, $ne: null } }, '_id');
      const validRegIds = validRegs.map((r) => r._id.toString());

      const existingRegIds = (event.registrations || []).map(toIdString).filter(Boolean);
      const mergedRegIds = Array.from(new Set([...existingRegIds, ...validRegIds]));
      const filteredRegIds = mergedRegIds.filter((id) => validRegIds.includes(id));

      const changedRegs = filteredRegIds.length !== existingRegIds.length || filteredRegIds.some((id, i) => id !== existingRegIds[i]);
      const changedCount = event.registrationCount !== filteredRegIds.length;

      if (changedRegs || changedCount) {
        event.registrations = filteredRegIds;
        event.registrationCount = filteredRegIds.length;
        await event.save();
        eventsUpdated += 1;
      }

      // Remove broken duplicate registrations by unique key expectation
      const duplicateGroups = await Registration.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: { event: '$event', student: '$student' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 }, '_id.student': { $ne: null } } }
      ]);

      for (const group of duplicateGroups) {
        const ids = group.ids.map((id) => id.toString());
        const keep = ids[0];
        const remove = ids.slice(1);
        if (remove.length > 0) {
          await Registration.deleteMany({ _id: { $in: remove } });
        }
      }

      console.log(`Checked event ${eventId}`);
    }

    // Remove registrations with missing or invalid student/event links
    const regs = await Registration.find({}, '_id event student');
    const eventIdSet = new Set(events.map((e) => e._id.toString()));
    const invalidRegIds = regs
      .filter((r) => !r.student || !r.event || !userIdSet.has(toIdString(r.student)) || !eventIdSet.has(toIdString(r.event)))
      .map((r) => r._id);

    if (invalidRegIds.length > 0) {
      await Registration.deleteMany({ _id: { $in: invalidRegIds } });
    }

    // Rebuild eventsRegistered links from registrations
    await User.updateMany({}, { $set: { eventsRegistered: [] } });
    const validRegistrations = await Registration.find({ student: { $exists: true, $ne: null } }, '_id student');
    for (const reg of validRegistrations) {
      await User.findByIdAndUpdate(reg.student, {
        $addToSet: { eventsRegistered: reg._id }
      });
    }

    console.log('Integrity repair completed');
    console.log(`Clubs updated: ${clubsUpdated}`);
    console.log(`Events updated: ${eventsUpdated}`);
    console.log(`Invalid registrations removed: ${invalidRegIds.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Integrity repair failed:', error.message);
    process.exit(1);
  }
};

repair();
