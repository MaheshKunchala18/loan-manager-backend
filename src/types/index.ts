export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'verifier' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanApplication {
  _id: string;
  userId: string;
  applicantFirstName: string;
  applicantLastName: string;
  employmentStatus: string;
  employmentAddress: string;
  reasonForLoan: string;
  loanAmount: number;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verifiedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  verificationDate?: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalLoans: number;
  totalBorrowers: number;
  cashDisbursed: number;
  cashReceived: number;
  savings: number;
  repaidLoans: number;
  otherAccounts: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
}

export interface LoanMetrics {
  monthlyData: {
    month: string;
    loansReleased: number;
    outstandingLoans: number;
    repaymentsCollected: number;
  }[];
} 