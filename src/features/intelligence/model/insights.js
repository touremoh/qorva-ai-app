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

/** Kinds of entry in a conversation — shared by the hook that builds them and the page that renders them. */
export const TURN = Object.freeze({ QUESTION: 'question', ANSWER: 'answer', ERROR: 'error' });
