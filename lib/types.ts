export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "member";
  created_at: string;
};

export type Member = {
  id: string;
  full_name: string;
  country: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  organisation: string | null;
  role_in_transaction: string | null;
  bio: string | null;
  responsibilities: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsPost = {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  emailed_at: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "on_hold" | "completed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectStage = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  position: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type ProjectStageItem = {
  id: string;
  stage_id: string;
  label: string;
  checked: boolean;
  position: number;
  created_at: string;
};

// A stage with its checklist items attached (as fetched together).
export type StageWithItems = ProjectStage & {
  project_stage_items: ProjectStageItem[];
};

export type Document = {
  id: string;
  name: string;
  description: string | null;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  project_id: string | null;
  uploaded_by: string | null;
  created_at: string;
};

// A due-diligence file uploaded against a member's Schedule 1 register entry.
export type MemberDocument = {
  id: string;
  member_id: string;
  doc_type: string;
  label: string;
  storage_path: string;
  file_name: string;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type ActivityType =
  | "news_post"
  | "project_created"
  | "document_uploaded"
  | "member_document_uploaded"
  | "stage_completed"
  | "member_added";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  summary: string;
  href: string;
  actorId: string | null;
  actorName?: string;
  occurredAt: string;
};

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export type SearchResults = {
  members: SearchResultItem[];
  projects: SearchResultItem[];
  documents: SearchResultItem[];
  news: SearchResultItem[];
};

export type MemberCompliance = {
  memberId: string;
  fullName: string;
  organisation: string | null;
  country: string | null;
  providedCount: number;
  totalRequired: number;
  percent: number;
  missing: { key: string; label: string }[];
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  entity_key: string;
  read_at: string | null;
  created_at: string;
};
