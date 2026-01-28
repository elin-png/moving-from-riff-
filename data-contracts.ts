/** CreateShiftRequest */
export interface CreateShiftRequest {
  /** User Id */
  user_id?: string | null;
  /**
   * Start Time
   * @format date-time
   */
  start_time: string;
  /**
   * End Time
   * @format date-time
   */
  end_time: string;
  /** Notes */
  notes?: string | null;
  /**
   * Status
   * @default "assigned"
   */
  status?: string;
}

/** CreateSwapRequest */
export interface CreateSwapRequest {
  /**
   * Shift Id
   * @format uuid
   */
  shift_id: string;
  /** Target User Id */
  target_user_id?: string | null;
}

/** CreateUserRequest */
export interface CreateUserRequest {
  /** User Id */
  user_id: string;
  /** Full Name */
  full_name: string;
  /** Email */
  email: string;
  /**
   * Role
   * @default "employee"
   */
  role?: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** Shift */
export interface Shift {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** User Id */
  user_id: string | null;
  /**
   * Start Time
   * @format date-time
   */
  start_time: string;
  /**
   * End Time
   * @format date-time
   */
  end_time: string;
  /** Status */
  status: string;
  /** Notes */
  notes: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** ShiftSwap */
export interface ShiftSwap {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Shift Id
   * @format uuid
   */
  shift_id: string;
  /** Requesting User Id */
  requesting_user_id: string;
  /** Target User Id */
  target_user_id: string | null;
  /** Status */
  status: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** ShiftSwapDetail */
export interface ShiftSwapDetail {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Shift Id
   * @format uuid
   */
  shift_id: string;
  /** Requesting User Id */
  requesting_user_id: string;
  /** Target User Id */
  target_user_id: string | null;
  /** Status */
  status: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  shift: Shift;
  initiator: UserProfile;
  target_user: UserProfile | null;
}

/** UpdateShiftRequest */
export interface UpdateShiftRequest {
  /** User Id */
  user_id?: string | null;
  /** Start Time */
  start_time?: string | null;
  /** End Time */
  end_time?: string | null;
  /** Notes */
  notes?: string | null;
  /** Status */
  status?: string | null;
}

/** UserProfile */
export interface UserProfile {
  /** User Id */
  user_id: string;
  /** Full Name */
  full_name: string;
  /** Email */
  email: string;
  /** Role */
  role: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export interface ListShiftsParams {
  /**
   * Start
   * Start of range
   * @format date-time
   */
  start: string;
  /**
   * End
   * End of range
   * @format date-time
   */
  end: string;
  /**
   * User Id
   * Filter by user ID
   */
  user_id?: string | null;
}

/** Response List Shifts */
export type ListShiftsData = Shift[];

export type ListShiftsError = HTTPValidationError;

export type CreateShiftData = Shift;

export type CreateShiftError = HTTPValidationError;

export interface ListMyShiftsParams {
  /**
   * Start
   * Start of range
   * @format date-time
   */
  start: string;
  /**
   * End
   * End of range
   * @format date-time
   */
  end: string;
}

/** Response List My Shifts */
export type ListMyShiftsData = Shift[];

export type ListMyShiftsError = HTTPValidationError;

export interface UpdateShiftParams {
  /** Shift Id */
  shiftId: string;
}

export type UpdateShiftData = Shift;

export type UpdateShiftError = HTTPValidationError;

export interface DeleteShiftParams {
  /** Shift Id */
  shiftId: string;
}

/** Response Delete Shift */
export type DeleteShiftData = boolean;

export type DeleteShiftError = HTTPValidationError;

/** Response List Users */
export type ListUsersData = UserProfile[];

export type CreateUserData = UserProfile;

export type CreateUserError = HTTPValidationError;

export type GetMyProfileData = UserProfile;

export type CreateSwapData = ShiftSwap;

export type CreateSwapError = HTTPValidationError;

export interface ListSwapsParams {
  /**
   * Status
   * Filter by status
   */
  status?: string | null;
}

/** Response List Swaps */
export type ListSwapsData = ShiftSwapDetail[];

export type ListSwapsError = HTTPValidationError;

export interface ClaimSwapParams {
  /**
   * Swap Id
   * @format uuid
   */
  swapId: string;
}

export type ClaimSwapData = ShiftSwap;

export type ClaimSwapError = HTTPValidationError;

export interface ApproveSwapParams {
  /**
   * Swap Id
   * @format uuid
   */
  swapId: string;
}

export type ApproveSwapData = ShiftSwap;

export type ApproveSwapError = HTTPValidationError;

export interface RejectSwapParams {
  /**
   * Swap Id
   * @format uuid
   */
  swapId: string;
}

export type RejectSwapData = ShiftSwap;

export type RejectSwapError = HTTPValidationError;
