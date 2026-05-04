import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import VerifyPage from "../pages/auth/VerifyPage";
import QuestionsPage from "../pages/questions/QuestionsPage";
import QuestionDetailPage from "../pages/questions/QuestionDetailPage";
// import SubmitPage from "../pages/submissions/SubmitPage";
// import SubmissionResultPage from "../pages/submissions/SubmissionResultPage";
import CreateQuestionPage from "../pages/questions/CreateQuestionPage";
// import EditQuestionPage from "../pages/questions/EditQuestionPage";
// import ReviewSubmissionPage from "../pages/review/ReviewSubmissionPage";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element ={<VerifyPage />} />

      {/* Protected (any logged-in user) */}
      <Route element={<ProtectedRoute />}>
        
        <Route path="/questions" element={<QuestionsPage />} />

        <Route path="/questions/:id" element={<QuestionDetailPage />} />

        {/* <Route path="/submit/:questionId" element={<SubmitPage />} />
        <Route path="/submission/:id" element={<SubmissionResultPage />} /> */}

      </Route>

      {/* Teacher-only routes */}
      <Route element={<RoleGuard role="teacher" />}>
        
        <Route path="/questions/create" element={<CreateQuestionPage />} />
        {/* <Route path="/edit-question/:id" element={<EditQuestionPage />} />
        <Route path="/review/:submissionId" element={<ReviewSubmissionPage />} /> */}

      </Route>

      {/* Default redirect
      <Route path="*" element={<Navigate to="/questions" />} /> */}

    </Routes>
  );
}