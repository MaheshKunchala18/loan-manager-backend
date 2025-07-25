import User from '../models/User';
import LoanApplication from '../models/LoanApplication';

export const createInitialAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@creditsea.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Initial admin user created successfully');
    console.log(`Admin Email: ${adminUser.email}`);
  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
  }
};

export const createSampleData = async (): Promise<void> => {
  try {
    const existingLoans = await LoanApplication.countDocuments();
    if (existingLoans > 0) {
      console.log('✅ Sample loan data already exists');
      return;
    }

    const sampleUsers = [
      {
        email: 'verifier@creditsea.com',
        password: 'Verifier123!',
        firstName: 'John',
        lastName: 'Verifier',
        role: 'verifier'
      },
      {
        email: 'user1@example.com',
        password: 'User123!',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'user'
      },
      {
        email: 'user2@example.com',
        password: 'User123!',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'user'
      }
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping creation`);
        createdUsers.push(existingUser);
      } else {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    const sampleLoans = [
      {
        userId: createdUsers[1]._id,
        applicantFirstName: 'Alice',
        applicantLastName: 'Johnson',
        employmentStatus: 'employed',
        employmentAddress: '123 Tech Street, San Francisco, CA',
        reasonForLoan: 'Home renovation and improvement',
        loanAmount: 250000,
        status: 'pending'
      },
      {
        userId: createdUsers[2]._id,
        applicantFirstName: 'Bob',
        applicantLastName: 'Smith',
        employmentStatus: 'self-employed',
        employmentAddress: '456 Business Ave, New York, NY',
        reasonForLoan: 'Business expansion and equipment purchase',
        loanAmount: 500000,
        status: 'verified',
        verifiedBy: createdUsers[0]._id,
        verificationDate: new Date()
      },
      {
        userId: createdUsers[1]._id,
        applicantFirstName: 'Alice',
        applicantLastName: 'Johnson',
        employmentStatus: 'employed',
        employmentAddress: '123 Tech Street, San Francisco, CA',
        reasonForLoan: 'Education expenses for professional development',
        loanAmount: 100000,
        status: 'approved',
        verifiedBy: createdUsers[0]._id,
        verificationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        approvalDate: new Date()
      }
    ];

    for (const loanData of sampleLoans) {
      const loan = new LoanApplication(loanData);
      await loan.save();
    }

    console.log('✅ Sample data created successfully');
    console.log(`Created ${createdUsers.length} users and ${sampleLoans.length} loan applications`);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}; 