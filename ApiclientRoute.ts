import {
  ApproveSwapData,
  CheckHealthData,
  ClaimSwapData,
  CreateShiftData,
  CreateShiftRequest,
  CreateSwapData,
  CreateSwapRequest,
  CreateUserData,
  CreateUserRequest,
  DeleteShiftData,
  GetMyProfileData,
  ListMyShiftsData,
  ListShiftsData,
  ListSwapsData,
  ListUsersData,
  RejectSwapData,
  UpdateShiftData,
  UpdateShiftRequest,
} from "./data-contracts";

export namespace Apiclient {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:shifts
   * @name list_shifts
   * @summary List Shifts
   * @request GET:/routes/shifts
   */
  export namespace list_shifts {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListShiftsData;
  }

  /**
   * No description
   * @tags dbtn/module:shifts
   * @name create_shift
   * @summary Create Shift
   * @request POST:/routes/shifts
   */
  export namespace create_shift {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateShiftRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateShiftData;
  }

  /**
   * No description
   * @tags dbtn/module:shifts
   * @name list_my_shifts
   * @summary List My Shifts
   * @request GET:/routes/my-shifts
   */
  export namespace list_my_shifts {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListMyShiftsData;
  }

  /**
   * No description
   * @tags dbtn/module:shifts
   * @name update_shift
   * @summary Update Shift
   * @request PUT:/routes/shifts/{shift_id}
   */
  export namespace update_shift {
    export type RequestParams = {
      /** Shift Id */
      shiftId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateShiftRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateShiftData;
  }

  /**
   * No description
   * @tags dbtn/module:shifts
   * @name delete_shift
   * @summary Delete Shift
   * @request DELETE:/routes/shifts/{shift_id}
   */
  export namespace delete_shift {
    export type RequestParams = {
      /** Shift Id */
      shiftId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteShiftData;
  }

  /**
   * No description
   * @tags dbtn/module:users
   * @name list_users
   * @summary List Users
   * @request GET:/routes/users
   */
  export namespace list_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUsersData;
  }

  /**
   * No description
   * @tags dbtn/module:users
   * @name create_user
   * @summary Create User
   * @request POST:/routes/users
   */
  export namespace create_user {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateUserRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateUserData;
  }

  /**
   * No description
   * @tags dbtn/module:users
   * @name get_my_profile
   * @summary Get My Profile
   * @request GET:/routes/users/me
   */
  export namespace get_my_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMyProfileData;
  }

  /**
   * No description
   * @tags dbtn/module:swaps
   * @name create_swap
   * @summary Create Swap
   * @request POST:/routes/swaps
   */
  export namespace create_swap {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateSwapRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateSwapData;
  }

  /**
   * No description
   * @tags dbtn/module:swaps
   * @name list_swaps
   * @summary List Swaps
   * @request GET:/routes/swaps
   */
  export namespace list_swaps {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Status
       * Filter by status
       */
      status?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListSwapsData;
  }

  /**
   * No description
   * @tags dbtn/module:swaps
   * @name claim_swap
   * @summary Claim Swap
   * @request POST:/routes/swaps/{swap_id}/claim
   */
  export namespace claim_swap {
    export type RequestParams = {
      /**
       * Swap Id
       * @format uuid
       */
      swapId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ClaimSwapData;
  }

  /**
   * No description
   * @tags dbtn/module:swaps
   * @name approve_swap
   * @summary Approve Swap
   * @request POST:/routes/swaps/{swap_id}/approve
   */
  export namespace approve_swap {
    export type RequestParams = {
      /**
       * Swap Id
       * @format uuid
       */
      swapId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ApproveSwapData;
  }

  /**
   * No description
   * @tags dbtn/module:swaps
   * @name reject_swap
   * @summary Reject Swap
   * @request POST:/routes/swaps/{swap_id}/reject
   */
  export namespace reject_swap {
    export type RequestParams = {
      /**
       * Swap Id
       * @format uuid
       */
      swapId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RejectSwapData;
  }
}
