export interface StudyPlan {
  id: string;
  subject: string;
  topics: string;
  exam_date: string;
  plan_content: string;
  created_at: string;
}

export interface StudyFormData {
  subject: string;
  topics: string;
  examDate: string;
}
