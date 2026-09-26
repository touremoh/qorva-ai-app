// Map InsightConversationTurnDTO to the shape InsightResultCard expects
export const turnToResult = (turn) => ({
    intent:              turn.intent,
    answerText:          turn.answerText,
    candidates:          turn.candidates,
    totalCandidateCount: turn.totalCandidateCount,
    metrics:             turn.metrics,
    charts:              turn.charts,
    followUpQuestions:   turn.followUpQuestions,
    disclaimer:          turn.disclaimer,
    rawData:             turn.rawData,
});
