const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function headers(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  memberCount?: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user_name: string | null;
  user_email: string | null;
  user_username: string | null;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

export interface Invitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  team_name?: string;
  inviter_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface TaskAssignee {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_username: string | null;
}

export interface SearchedUser {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
}

export interface TeamTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  task_hash: string | null;
  transaction_hash: string | null;
  chain_timestamp: string | null;
  team_id: string | null;
  board_column: string;
  board_order: number;
  created_at: string;
  updated_at: string;
  assignees: TaskAssignee[];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, { ...init, headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'Request failed');
  return data as T;
}

export async function createTeam(name: string): Promise<Team> {
  return request('/api/teams', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function listTeams(): Promise<Team[]> {
  return request('/api/teams');
}

export async function getTeam(id: string): Promise<TeamDetail> {
  return request(`/api/teams/${id}`);
}

export async function inviteMember(teamId: string, opts: { userId?: string; email?: string }): Promise<Invitation> {
  return request(`/api/teams/${teamId}/invite`, { method: 'POST', body: JSON.stringify(opts) });
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  await request(`/api/teams/invitations/${invitationId}/accept`, { method: 'POST' });
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  await request(`/api/teams/invitations/${invitationId}/reject`, { method: 'POST' });
}

export async function deleteTeam(id: string): Promise<void> {
  await request(`/api/teams/${id}`, { method: 'DELETE' });
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  await request(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
}

export async function listTeamTasks(teamId: string): Promise<TeamTask[]> {
  return request(`/api/teams/${teamId}/tasks`);
}

export async function createTeamTask(
  teamId: string,
  body: { title: string; description?: string; priority?: string; dueDate?: string; boardColumn?: string; assigneeIds?: string[] }
): Promise<TeamTask> {
  return request(`/api/teams/${teamId}/tasks`, { method: 'POST', body: JSON.stringify(body) });
}

export async function getTeamTask(teamId: string, taskId: string): Promise<TeamTask> {
  return request(`/api/teams/${teamId}/tasks/${taskId}`);
}

export async function updateTeamTask(
  teamId: string,
  taskId: string,
  body: { title?: string; description?: string; status?: string; priority?: string; boardColumn?: string; boardOrder?: number; assigneeIds?: string[] }
): Promise<TeamTask> {
  return request(`/api/teams/${teamId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteTeamTask(teamId: string, taskId: string): Promise<void> {
  await request(`/api/teams/${teamId}/tasks/${taskId}`, { method: 'DELETE' });
}

export async function moveTask(teamId: string, taskId: string, boardColumn: string, boardOrder: number): Promise<void> {
  await request(`/api/teams/${teamId}/tasks/${taskId}/move`, {
    method: 'PUT',
    body: JSON.stringify({ boardColumn, boardOrder }),
  });
}

export async function reorderTasks(teamId: string, moves: { id: string; boardColumn: string; boardOrder: number }[]): Promise<void> {
  await request(`/api/teams/${teamId}/tasks/reorder`, { method: 'PUT', body: JSON.stringify({ moves }) });
}

export async function setAssignees(teamId: string, taskId: string, assigneeIds: string[]): Promise<TaskAssignee[]> {
  return request(`/api/teams/${teamId}/tasks/${taskId}/assignees`, {
    method: 'PUT',
    body: JSON.stringify({ assigneeIds }),
  });
}

export async function searchUsers(q: string): Promise<SearchedUser[]> {
  if (q.length < 2) return [];
  return request(`/api/users/search?q=${encodeURIComponent(q)}`);
}

export async function checkUsername(username: string): Promise<{ available: boolean; reason?: string }> {
  const res = await fetch(`${API_BASE}/auth/check-username?username=${encodeURIComponent(username)}`);
  return res.json();
}

export async function setUsername(username: string, name?: string): Promise<{ user: any }> {
  return request('/auth/set-username', { method: 'POST', body: JSON.stringify({ username, name }) });
}

export async function getNotifications(limit = 30): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  return request(`/api/notifications?limit=${limit}`);
}

export async function getUnreadCount(): Promise<number> {
  const data = await request<{ count: number }>('/api/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/api/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await request('/api/notifications/read-all', { method: 'PUT' });
}
