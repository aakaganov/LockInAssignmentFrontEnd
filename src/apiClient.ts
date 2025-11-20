import { Requesting } from "@engine";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
console.log(API_BASE);

async function post(endpoint: string, body: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  
  try {
    return JSON.parse(text);
  } catch {
    console.warn("Non-JSON response from API:", text);
    return {}; // fallback empty object
  }
}
console.log(API_BASE);
/**
async function p
ost(endpoint: string, body: any) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
} */

// ===== ACCOUNT ACTIONS =====

// Signup / Add user with password
export async function addUser(name: string, email: string, password: string) {
  return post("/Account/addUser", { name, email, password });
}

// Get user info (no password returned)
export async function getUser(userId: string) {
  return post("/Account/getUser", { userId });
}

// Delete user
export async function deleteUser(userId: string) {
  const res = await Requesting.request({
    path: "/api/Account/deleteUser",
    userId,
  });
  if (res.error) throw new Error(res.error);
  return res;
}

// Update user info (optional password update)
export async function updateUser(
  userId: string,
  name: string,
  email: string,
  password?: string
) {
  const res = await Requesting.request({
    path: "/api/Account/updateUser",
    userId,
    name,
    email,
    password,
  });
  if (res.error) throw new Error(res.error);
  return res;
}
// Login user with password
export async function loginUser(email: string, password: string) {
  return post("/Account/loginUser", { email, password });
}

// ===== TASK ACTIONS =====
export async function createTask(
  ownerId: string,
  title: string,
  description: string | null,
  dueDate: string | null,
  estimatedTime: number,
) {
  return post("/Task/createTask", {
    ownerId,
    title,
    description,
    dueDate,
    estimatedTime,
  });
}

export async function editTask(
  taskId: string,
  title?: string,
  description?: string,
  dueDate?: string,
  estimatedTime?: number,
) {
  return post("/Task/editTask", {
    taskId,
    title,
    description,
    dueDate,
    estimatedTime,
  });
}

export async function completeTask(taskId: string, actualTime: number) {
  return post("/Task/completeTask", { taskId, actualTime });
}

export async function deleteTask(taskId: string) {
  return post("/Task/deleteTask", { taskId });
}

export async function listTasks(ownerId: string) {
  return post("/Task/listTasks", { ownerId });
}

export async function suggestTaskOrder(
  tasks: {
    taskId: string;
    title: string;
    description?: string | null;
    dueDate?: string | null;
    estimatedTime: number;
  }[],
) {
  return post("/Task/suggestTaskOrder", { tasks });
}

// ===== GROUP ACTIONS =====
export async function createGroup({
  ownerId,
  groupName,
  confirmationRequired,
  invitedEmails,
}: {
  ownerId: string;
  groupName: string;
  confirmationRequired: boolean;
  invitedEmails: string[];
}) {
  return post("/FriendGroup/createGroup", {
    ownerId,
    groupName,
    confirmationRequired,
    invitedEmails, // send as invitedEmails
  });
}

export async function addMember(groupId: string, userId: string) {
  return post("/FriendGroup/addMember", { groupId, userId });
}

export async function removeMember(groupId: string, userId: string) {
  return post("/FriendGroup/removeMember", { groupId, userId });
}

export async function listGroups(userId: string) {
  return post("/FriendGroup/listGroups", { userId });
}

export async function setConfirmationPolicy(
  groupId: string,
  requiresConfirmation: boolean,
) {
  return post("/FriendGroup/setConfirmationPolicy", {
    groupId,
    requiresConfirmation,
  });
}
// ===== GROUP INVITE ACTIONS =====

// Invite a user to a group by email (sends a notification, does NOT add them yet)
export async function inviteUserByEmail(payload: {
  groupId: string;
  email: string;
  invitedBy: string;
}) {
  return post("/FriendGroup/inviteUserByEmail", payload);
}

// Accept a group invite (user joins the group)

export async function acceptInvite(payload: {
  groupId: string;
  userId: string;
}) {
  return post("/FriendGroup/acceptInvite", payload);
}

// Decline a group invite
export async function declineInvite(payload: {
  groupId: string;
  userId: string;
}) {
  return post("/FriendGroup/declineInvite", payload);
}

// ===== CONFIRMATION ACTIONS =====
// ===== CONFIRMATION ACTIONS =====
export async function requestConfirmation(
  taskId: string,
  requestedBy: string,
  taskName: string, // ✅ add
  completionTime?: number,
  groupId?: string,
  selectedPeers?: string[],
  //actualTime?: number
) {
  // ✅ Support both legacy and extended formats
  const payload: any = { taskId, requestedBy, taskName };

  if (completionTime !== undefined) payload.completionTime = completionTime;
  if (groupId) payload.groupId = groupId;
  if (selectedPeers && selectedPeers.length > 0)
    payload.selectedPeerIds = selectedPeers;

  return post("/ConfirmTask/requestConfirmation", payload);
}

export async function confirmTask(taskId: string, peerId: string) {
  return post("/ConfirmTask/confirmTask", { taskId, peerId });
}

export async function finalizeConfirmation(taskId: string) {
  return post("/ConfirmTask/finalizeConfirmation", { taskId });
}

export async function getConfirmations(userId: string) {
  return post("/ConfirmTask/getConfirmations", { userId });
}
export async function denyTask(taskId: string, peerId: string) {
  return post("/ConfirmTask/denyTask", { taskId, peerId });
}

// ===== LEADERBOARD ACTIONS =====
export async function recordCompletion(
  userId: string,
  actualTime: number,
  groupId: string,
) {
  return post("/Leaderboard/recordCompletion", { userId, actualTime, groupId });
}

export async function getLeaderboardByTasks(groupId: string) {
  return post("/Leaderboard/getLeaderboardByTasks", { groupId });
}

export async function getLeaderboardByTime(groupId: string) {
  return post("/Leaderboard/getLeaderboardByTime", { groupId });
}

export async function resetWeeklyStats() {
  return post("/Leaderboard/resetWeeklyStats", {});
}

// ===== NOTIFICATION ACTIONS =====

// Get all notifications (including group invites) for a user
export async function getNotifications(payload: { userId: string }) {
  return post("/Notification/list", payload);
}

// Accept a group invite from notifications
export async function acceptGroupInvite(payload: {
  groupId: string;
  userId: string;
}) {
  return post("/Notification/acceptInvite", payload);
}

export async function deleteGroup(payload: {
  groupId: string;
  userId: string;
}) {
  return post("/FriendGroup/deleteGroup", payload);
}
export async function fetchPendingConfirmationsForPeer(peerId: string) {
  return post("/ConfirmTask/getPendingConfirmationsForPeer", { peerId });
}
export async function leaveGroup(groupId: string, userId: string) {
  return post("/FriendGroup/leaveGroup", { groupId, userId });
}
