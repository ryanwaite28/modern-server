import { Users } from "../../_common/models/user.model";
import { SAFESTAR_STATUSES } from "../enums/safestar.enum";
import { ITracking } from "../interfaces/tracking.interface";
import { Trackings, TrackingRequests } from "../models/tracking.model";
import { getAll, getCount, paginateTable } from '../../_common/repos/_common.repo';
import { convertModels, user_attrs_slim } from "../../_common/common.chamber";
import { SafestarUsersInfo } from "../models/user.model";



export function check_user_tracking(you_id: number, user_id: number) {
  return Trackings.findOne({
    where: { user_id: you_id, tracking_id: user_id },
    include: [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }],
  });
}

export function check_user_tracking_request(you_id: number, user_id: number) {
  return TrackingRequests.findOne({
    where: { user_id: you_id, tracking_id: user_id, status: SAFESTAR_STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }],
  });
}

export async function get_user_trackers_count(
  you_id: number
) {
  const count = await Trackings.count({
    where: { tracking_id: you_id },
  });
  return count;
}

export async function get_user_trackings_count(
  you_id: number
) {
  const count = await Trackings.count({
    where: { user_id: you_id },
  });
  return count;
}

export async function get_user_tracker_requests_pending_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { tracking_id: you_id, status: SAFESTAR_STATUSES.PENDING },
  });
  return count;
}

export async function get_user_tracking_requests_pending_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { user_id: you_id, status: SAFESTAR_STATUSES.PENDING },
  });
  return count;
}

export async function get_user_tracker_requests_all_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { tracking_id: you_id },
  });
  return count;
}

export async function get_user_tracking_requests_all_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { user_id: you_id },
  });
  return count;
}



export async function get_user_trackers_all(
  you_id: number,
) {
  const trackers = await Trackings.findAll({
    where: { tracking_id: you_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  }).then((models) => {
    return convertModels<ITracking>(models);
  });
  return trackers;
}

export async function get_user_trackings_all(
  you_id: number
) {
  const trackings = await Trackings.findAll({
    where: { user_id: you_id },
    include: [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  });
  return trackings;
}

export async function get_user_trackers(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    Trackings as any,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }],
  );
  return trackers;
}

export async function get_user_trackings(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    Trackings as any,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  );
  return trackings;
}



export async function get_user_tracker_requests_all(
  you_id: number,
) {
  const trackers = await TrackingRequests.findAll({
    where: { tracking_id: you_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  });
  return trackers;
}

export async function get_user_tracking_requests_all(
  you_id: number
) {
  const trackings = await TrackingRequests.findAll({
    where: { user_id: you_id },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  });
  return trackings;
}

export async function get_user_tracker_requests_pending_all(
  you_id: number,
) {
  const trackers = await TrackingRequests.findAll({
    where: { tracking_id: you_id, status: SAFESTAR_STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  });
  return trackers;
}

export async function get_user_tracking_requests_pending_all(
  you_id: number
) {
  const trackings = await TrackingRequests.findAll({
    where: { user_id: you_id, status: SAFESTAR_STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  });
  return trackings;
}

export async function get_user_tracker_requests_pending(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    TrackingRequests as any,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }],
    undefined,
    undefined,
    { status: SAFESTAR_STATUSES.PENDING },
  );
  return trackers;
}

export async function get_user_tracking_requests_pending(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    TrackingRequests as any,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }],
    undefined,
    undefined,
    { status: SAFESTAR_STATUSES.PENDING },
  );
  return trackings;
}


export async function get_user_tracker_requests(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    TrackingRequests as any,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  );
  return trackers;
}

export async function get_user_tracking_requests(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    TrackingRequests as any,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      include: [{ model: SafestarUsersInfo, as: 'safestar_info' }],
    }]
  );
  return trackings;
}
