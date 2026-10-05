export const QUESTION_AUTHOR_ROLES = ["teacher", "content_manager"];

export const isQuestionAuthor = (role) => QUESTION_AUTHOR_ROLES.includes(role);
