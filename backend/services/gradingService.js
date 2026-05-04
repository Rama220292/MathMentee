const normalize = (str) => {
  return (str || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*");
};

const isEquivalent = (a, b) => {
  if (!a || !b) return false;

  const normA = normalize(a);
  const normB = normalize(b);

  if (normA === normB) return true;

  // Handle equation flip
  if (normA.includes("=") && normB.includes("=")) {
    const [a1, a2] = normA.split("=");
    const [b1, b2] = normB.split("=");
    if (a1 === b2 && a2 === b1) return true;
  }

  return false;
};

const gradeAnswer = (studentAnswer, question) => {
  let score = 0;
  let feedback = [];
  let stepResults = [];

  const model = question.model_answer;

  // 🧠 1. Final answer
  const finalCorrect = isEquivalent(
    studentAnswer.final_answer,
    model.final_answer
  );

  if (finalCorrect) {
    score += question.final_answer_marks;
    feedback.push("Final answer is correct");
  } else {
    feedback.push("Final answer is incorrect");
  }

  // 🧠 2. Step matching (order-independent)
  const usedStudentSteps = new Set();

  model.steps.forEach((modelStep, modelIndex) => {
    let matched = false;

    for (let i = 0; i < (studentAnswer.steps || []).length; i++) {
      if (usedStudentSteps.has(i)) continue;

      if (isEquivalent(studentAnswer.steps[i], modelStep.content)) {
        score += modelStep.marks;
        usedStudentSteps.add(i);

        stepResults.push({
          step: modelStep.content,
          correct: true,
          marksAwarded: modelStep.marks
        });

        matched = true;
        break;
      }
    }

    if (!matched) {
      stepResults.push({
        step: modelStep.content,
        correct: false,
        marksAwarded: 0
      });

      feedback.push(`Missing or incorrect step: ${modelStep.content}`);
    }
  });

  return {
    score,
    totalMarks: question.total_marks,
    feedback,
    stepResults,
    finalCorrect
  };
};

module.exports = gradeAnswer;