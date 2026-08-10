import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import { seedUsers, seedServices, seedStaffData } from './seedData.js';
import { calculateEndTime } from '../utils/timeUtils.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await Appointment.deleteMany({});
    await Service.deleteMany({});
    await Staff.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding Users...');
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users.`);

    console.log('Seeding Services...');
    const createdServices = await Service.insertMany(seedServices);
    console.log(`Created ${createdServices.length} services.`);

    console.log('Seeding Staff...');
    const createdStaff = [];
    for (const staffData of seedStaffData) {
      const userMatch = createdUsers.find((u) => u.email === staffData.email);
      const staff = await Staff.create({
        ...staffData,
        user: userMatch ? userMatch._id : null,
      });
      createdStaff.push(staff);
    }
    console.log(`Created ${createdStaff.length} staff members.`);

    console.log('Generating realistic Appointments dataset...');
    const clientUsers = createdUsers.filter((u) => u.role === 'user');

    const appointmentStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'RESCHEDULED'];
    const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    const reasons = [
      'Routine health assessment & checkup',
      'Follow-up evaluation on recent diagnosis',
      'Initial consultation & roadmap planning',
      'Strategy breakdown for enterprise migration',
      'Deep tissue physical therapy session',
      'Quarterly investment portfolio checkup',
    ];

    const appointmentsToCreate = [];

    // Helper to get relative date
    const getRelativeDate = (dayOffset) => {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      // Ensure weekday if offset falls on weekend
      if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
      if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // Create 24 realistic appointments across past, present and future
    const dateOffsets = [-14, -10, -7, -5, -3, -1, 0, 1, 2, 3, 5, 7, 10, 14];

    for (let i = 0; i < 24; i++) {
      const user = clientUsers[i % clientUsers.length];
      const staff = createdStaff[i % createdStaff.length];
      const service = createdServices[i % createdServices.length];
      const dateOffset = dateOffsets[i % dateOffsets.length];
      const appDate = getRelativeDate(dateOffset);
      const startTime = timeSlots[i % timeSlots.length];
      const endTime = calculateEndTime(startTime, service.duration);
      const reason = reasons[i % reasons.length];

      let status = 'PENDING';
      if (dateOffset < 0) {
        status = i % 4 === 0 ? 'CANCELLED' : 'COMPLETED';
      } else if (dateOffset === 0) {
        status = i % 2 === 0 ? 'CONFIRMED' : 'PENDING';
      } else {
        const futureStatuses = ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'REJECTED'];
        status = futureStatuses[i % futureStatuses.length];
      }

      appointmentsToCreate.push({
        user: user._id,
        staff: staff._id,
        service: service._id,
        appointmentDate: appDate,
        startTime,
        endTime,
        reason,
        notes: status === 'RESCHEDULED' ? 'Rescheduled due to calendar adjustment' : 'Client pre-requisites reviewed.',
        status,
        cancellationReason: status === 'CANCELLED' ? 'Schedule conflict on user side' : '',
        rejectionReason: status === 'REJECTED' ? 'Staff unavailable during selected window' : '',
      });
    }

    const createdAppointments = await Appointment.insertMany(appointmentsToCreate);
    console.log(`Created ${createdAppointments.length} appointments successfully!`);

    console.log('\n--- SEED SUMMARY ---');
    console.log('Demo Accounts:');
    console.log('1. ADMIN:   admin@schedulo.com / password123');
    console.log('2. STAFF 1: staff.vance@schedulo.com / password123 (Dr. Evelyn Vance)');
    console.log('3. STAFF 2: staff.marcus@schedulo.com / password123 (Marcus Holloway)');
    console.log('4. STAFF 3: staff.sophia@schedulo.com / password123 (Sophia Chen)');
    console.log('5. USER 1:  user.alice@schedulo.com / password123');
    console.log('6. USER 2:  user.bob@schedulo.com / password123');
    console.log('---------------------\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await closeDB();
  }
};

// Execute if run directly
if (process.argv[1].includes('seeder.js')) {
  seedDatabase();
}
