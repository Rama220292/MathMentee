const QUESTION_AUTHOR_ROLES = ["teacher", "content_manager"];

const isQuestionAuthor = (role) => QUESTION_AUTHOR_ROLES.includes(role);

module.exports = { QUESTION_AUTHOR_ROLES, isQuestionAuthor };
