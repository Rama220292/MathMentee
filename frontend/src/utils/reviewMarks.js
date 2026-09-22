export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const totalAwarded = (rows) => rows.reduce(
  (sum, row) => sum + toNumber(row.marks_awarded),
  0
);

export const marksMatch = (left, right) => Math.abs(Number(left) - Number(right)) < 0.001;

const canApplySourceRow = (sourceRow, schemeRow) => (
  sourceRow
  && marksMatch(sourceRow.marks_available, schemeRow.marks_available)
  && toNumber(sourceRow.marks_awarded) <= toNumber(schemeRow.marks_available)
);

const isFinalCriterion = (value = "") => value.toLowerCase().includes("final");

const canMatchCriterionKind = (sourceRow, schemeRow) => {
  const sourceIsFinal = isFinalCriterion(sourceRow?.criterion);
  const schemeIsFinal = isFinalCriterion(schemeRow.criterion);
  return sourceIsFinal === schemeIsFinal;
};

const findSourceRow = (source, schemeRow, preferredIndex, usedIndexes) => {
  if (
    !usedIndexes.has(preferredIndex)
    && canApplySourceRow(source[preferredIndex], schemeRow)
    && canMatchCriterionKind(source[preferredIndex], schemeRow)
  ) {
    return preferredIndex;
  }

  return source.findIndex((sourceRow, sourceIndex) => (
    !usedIndexes.has(sourceIndex)
    && canApplySourceRow(sourceRow, schemeRow)
    && canMatchCriterionKind(sourceRow, schemeRow)
  ));
};

export const buildReviewRows = (submission) => {
  const modelSteps = submission.questionId?.model_answer?.steps || [];
  const savedBreakdown = submission.tutor_marks_breakdown;
  const aiBreakdown = submission.marks_breakdown || [];
  const source = savedBreakdown?.length ? savedBreakdown : aiBreakdown;
  const schemeRows = [
    ...modelSteps.map((step, index) => ({
      label: `Step ${index + 1}`,
      criterion: `Step ${index + 1}`,
      modelContent: step.content,
      marks_available: step.marks
    })),
    ...(submission.questionId?.final_answer_marks != null ? [{
      label: "Final answer",
      criterion: "Final answer",
      modelContent: submission.questionId?.model_answer?.final_answer || "",
      marks_available: submission.questionId.final_answer_marks
    }] : [])
  ];

  if (schemeRows.length) {
    const usedIndexes = new Set();

    return schemeRows.map((row, index) => {
      const sourceIndex = findSourceRow(source, row, index, usedIndexes);
      const matchedSource = sourceIndex >= 0 ? source[sourceIndex] : null;
      if (sourceIndex >= 0) usedIndexes.add(sourceIndex);

      return {
        ...row,
        marks_awarded: matchedSource?.marks_awarded ?? 0,
        evidence: matchedSource?.evidence || "",
        feedback: matchedSource?.feedback || ""
      };
    });
  }

  return source.map((row, index) => ({
    label: row.criterion || `Criterion ${index + 1}`,
    criterion: row.criterion || `Criterion ${index + 1}`,
    modelContent: "",
    marks_awarded: Math.min(toNumber(row.marks_awarded), toNumber(row.marks_available)),
    marks_available: row.marks_available ?? 0,
    evidence: row.evidence || "",
    feedback: row.feedback || ""
  }));
};
