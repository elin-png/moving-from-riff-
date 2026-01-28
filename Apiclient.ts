import {
  ApproveSwapData,
  ApproveSwapError,
  ApproveSwapParams,
  CheckHealthData,
  ClaimSwapData,
  ClaimSwapError,
  ClaimSwapParams,
  CreateShiftData,
  CreateShiftError,
  CreateShiftRequest,
  CreateSwapData,
  CreateSwapError,
  CreateSwapRequest,
  CreateUserData,
  CreateUserError,
  CreateUserRequest,
  DeleteShiftData,
  DeleteShiftError,
  DeleteShiftParams,
  GetMyProfileData,
  ListMyShiftsData,
  ListMyShiftsError,
  ListMyShiftsParams,
  ListShiftsData,
  ListShiftsError,
  ListShiftsParams,
  ListSwapsData,
  ListSwapsError,
  ListSwapsParams,
  ListUsersData,
  RejectSwapData,
  RejectSwapError,
  RejectSwapParams,
  UpdateShiftData,
  UpdateShiftError,
  UpdateShiftParams,
  UpdateShiftRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Apiclient<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:shifts
   * @name list_shifts
   * @summary List Shifts
   * @request GET:/routes/shifts
   */
  list_shifts = (query: ListShiftsParams, params: RequestParams = {}) =>
    this.request<ListShiftsData, ListShiftsError>({
      path: `/routes/shifts`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:shifts
   * @name create_shift
   * @summary Create Shift
   * @request POST:/routes/shifts
   */
  create_shift = (data: CreateShiftRequest, params: RequestParams = {}) =>
    this.request<CreateShiftData, CreateShiftError>({
      path: `/routes/shifts`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:shifts
   * @name list_my_shifts
   * @summary List My Shifts
   * @request GET:/routes/my-shifts
   */
  list_my_shifts = (query: ListMyShiftsParams, params: RequestParams = {}) =>
    this.request<ListMyShiftsData, ListMyShiftsError>({
      path: `/routes/my-shifts`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:shifts
   * @name update_shift
   * @summary Update Shift
   * @request PUT:/routes/shifts/{shift_id}
   */
  update_shift = ({ shiftId, ...query }: UpdateShiftParams, data: UpdateShiftRequest, params: RequestParams = {}) =>
    this.request<UpdateShiftData, UpdateShiftError>({
      path: `/routes/shifts/${shiftId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:shifts
   * @name delete_shift
   * @summary Delete Shift
   * @request DELETE:/routes/shifts/{shift_id}
   */
  delete_shift = ({ shiftId, ...query }: DeleteShiftParams, params: RequestParams = {}) =>
    this.request<DeleteShiftData, DeleteShiftError>({
      path: `/routes/shifts/${shiftId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:users
   * @name list_users
   * @summary List Users
   * @request GET:/routes/users
   */
  list_users = (params: RequestParams = {}) =>
    this.request<ListUsersData, any>({
      path: `/routes/users`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:users
   * @name create_user
   * @summary Create User
   * @request POST:/routes/users
   */
  create_user = (data: CreateUserRequest, params: RequestParams = {}) =>
    this.request<CreateUserData, CreateUserError>({
      path: `/routes/users`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:users
   * @name get_my_profile
   * @summary Get My Profile
   * @request GET:/routes/users/me
   */
  get_my_profile = (params: RequestParams = {}) =>
    this.request<GetMyProfileData, any>({
      path: `/routes/users/me`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:swaps
   * @name create_swap
   * @summary Create Swap
   * @request POST:/routes/swaps
   */
  create_swap = (data: CreateSwapRequest, params: RequestParams = {}) =>
    this.request<CreateSwapData, CreateSwapError>({
      path: `/routes/swaps`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:swaps
   * @name list_swaps
   * @summary List Swaps
   * @request GET:/routes/swaps
   */
  list_swaps = (query: ListSwapsParams, params: RequestParams = {}) =>
    this.request<ListSwapsData, ListSwapsError>({
      path: `/routes/swaps`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:swaps
   * @name claim_swap
   * @summary Claim Swap
   * @request POST:/routes/swaps/{swap_id}/claim
   */
  claim_swap = ({ swapId, ...query }: ClaimSwapParams, params: RequestParams = {}) =>
    this.request<ClaimSwapData, ClaimSwapError>({
      path: `/routes/swaps/${swapId}/claim`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:swaps
   * @name approve_swap
   * @summary Approve Swap
   * @request POST:/routes/swaps/{swap_id}/approve
   */
  approve_swap = ({ swapId, ...query }: ApproveSwapParams, params: RequestParams = {}) =>
    this.request<ApproveSwapData, ApproveSwapError>({
      path: `/routes/swaps/${swapId}/approve`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:swaps
   * @name reject_swap
   * @summary Reject Swap
   * @request POST:/routes/swaps/{swap_id}/reject
   */
  reject_swap = ({ swapId, ...query }: RejectSwapParams, params: RequestParams = {}) =>
    this.request<RejectSwapData, RejectSwapError>({
      path: `/routes/swaps/${swapId}/reject`,
      method: "POST",
      ...params,
    });
}
