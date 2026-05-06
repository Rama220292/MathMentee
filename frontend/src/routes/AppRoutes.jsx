import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import VerifyPage from "../pages/auth/VerifyPage";
import QuestionsPage from "../pages/questions/QuestionsPage";
import QuestionDetailPage from "../pages/questions/QuestionDetailPage";
import SubmitPage from "../pages/submissions/SubmitPage";
import SubmissionResultPage from "../pages/submissions/SubmissionResultPage";
import CreateQuestionPage from "../pages/questions/CreateQuestionPage";
import ReviewSubmissionPage from "../pages/review/ReviewSubmissionPage";
import StudentSubmissionsPage from "../pages/submissions/StudentSubmissionsPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";
import SubmissionsPage from "../pages/submissions/SubmissionsPage";
import HomeRedirect from "../pages/auth/HomeRedirect";
import FeedbackPage from "../pages/common/FeedbackPage";
import SettingsPage from "../pages/common/SettingsPage";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/verify" element ={<VerifyPage />} />

      {/* Protected (any logged-in user) */}
      <Route element={<ProtectedRoute />}>

        {/* Shared routes */}
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/submit/:questionId" element={<SubmitPage />} />
        <Route path="/submissions/:id" element={<SubmissionResultPage />} />
        <Route path="/submissions" element={<StudentSubmissionsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        
        {/* 👨‍🏫 Teacher routes INSIDE ProtectedRoute */}
        <Route element={<RoleGuard role="teacher" />}>

          <Route path="/questions/create" element={<CreateQuestionPage />} />
          <Route path="/teacher/submissions" element={<SubmissionsPage />} />
          <Route path="/submissions/:id/review" element={<ReviewSubmissionPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        </Route>

      </Route>

      {/* Default redirect
      <Route path="*" element={<Navigate to="/questions" />} /> */}

    </Routes>
  );
}