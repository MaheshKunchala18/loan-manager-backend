import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanApplication extends Document {
  userId: mongoose.Types.ObjectId;
  applicantFirstName: string;
  applicantLastName: string;
  employmentStatus: string;
  employmentAddress: string;
  reasonForLoan: string;
  loanAmount: number;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
  getFullName(): string;
  getStatusColor(): string;
}

const LoanApplicationSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  applicantFirstName: {
    type: String,
    required: [true, 'Applicant first name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  applicantLastName: {
    type: String,
    required: [true, 'Applicant last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  employmentStatus: {
    type: String,
    required: [true, 'Employment status is required'],
    enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired'],
    trim: true
  },
  employmentAddress: {
    type: String,
    required: [true, 'Employment address is required'],
    trim: true,
    maxlength: [200, 'Employment address cannot be more than 200 characters']
  },
  reasonForLoan: {
    type: String,
    required: [true, 'Reason for loan is required'],
    trim: true,
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1000, 'Minimum loan amount is ₹1,000'],
    max: [10000000, 'Maximum loan amount is ₹1,00,00,000']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: {
    type: Date
  },
  approvalDate: {
    type: Date
  },
  rejectionDate: {
    type: Date
  },
  comments: {
    type: String,
    maxlength: [1000, 'Comments cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Get full name method
LoanApplicationSchema.methods.getFullName = function(): string {
  return `${this.applicantFirstName} ${this.applicantLastName}`;
};

// Get status color for UI
LoanApplicationSchema.methods.getStatusColor = function(): string {
  const colors: Record<string, string> = {
    pending: 'yellow',
    verified: 'blue',
    approved: 'green',
    rejected: 'red'
  };
  return colors[this.status as string] || 'gray';
};

LoanApplicationSchema.index({ userId: 1 });
LoanApplicationSchema.index({ status: 1 });
LoanApplicationSchema.index({ createdAt: -1 });
LoanApplicationSchema.index({ verifiedBy: 1 });
LoanApplicationSchema.index({ approvedBy: 1 });

export default mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema); 