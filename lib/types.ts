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
