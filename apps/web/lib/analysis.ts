import {
  AssessmentBundle,
  Highlight,
  NoteBundle,
  PractitionerTechniqueObservation,
  Session,
  SpeakerMapping,
  TopicSentimentSummary,
  TranscriptSegment
} from "./types";

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function classifySpeakers(segments: TranscriptSegment[]): SpeakerMapping[] {
  const labels = Array.from(new Set(segments.map((segment) => segment.speakerLabel)));
  return labels.map((label) => {
    const texts = segments
      .filter((segment) => segment.speakerLabel === label)
      .map((segment) => segment.text.toLowerCase());
    const questionCount = texts.filter((text) => text.includes("?")).length;
    const helperLanguage = texts.filter((text) =>
      ["would it help", "sounds", "we can", "focus", "thank you"].some((phrase) => text.includes(phrase))
    ).length;
    const clientLanguage = texts.filter((text) =>
      ["i feel", "i am", "i could", "rent", "bus", "overwhelmed", "behind"].some((phrase) => text.includes(phrase))
    ).length;
    const assignedRole = questionCount + helperLanguage >= clientLanguage ? "Practitioner" : "Client";
    return {
      originalSpeakerLabel: label,
      assignedRole,
      displayName: assignedRole,
      confidence: assignedRole === "Practitioner" ? 0.91 : 0.86,
      evidence:
        assignedRole === "Practitioner"
          ? ["Asked open-ended questions.", "Used reflective and collaborative language."]
          : ["Reported emotions, stressors, practical barriers, and needs."],
      confirmedByUser: false
    };
  });
}

export function detectHighlight(segment: TranscriptSegment): Highlight | null {
  const lower = segment.text.toLowerCase();
  const createdAt = new Date().toISOString();
  if (lower.includes("nothing changes") || lower.includes("overwhelmed")) {
    return {
      id: makeId("hl"),
      sessionId: segment.sessionId,
      startTime: segment.startTime,
      endTime: segment.endTime,
      highlightType: "High attention",
      severity: "High",
      title: "Stuckness / discouragement",
      evidenceText: segment.text,
      topic: "Emotional distress and follow-through",
      sentimentLabel: "negative",
      emotionLabel: lower.includes("overwhelmed") ? "Overwhelm" : "Discouragement",
      suggestedFocus: "Validate effort and clarify the next manageable step.",
      suggestedTechnique: "Reflective listening",
      suggestedLanguage:
        "It sounds like you have been trying hard and feel worn down because things still have not changed.",
      isLive: true,
      isConfirmed: false,
      createdAt
    };
  }
  if (lower.includes("behind on rent") || lower.includes("bus") || lower.includes("housing office")) {
    return {
      id: makeId("hl"),
      sessionId: segment.sessionId,
      startTime: segment.startTime,
      endTime: segment.endTime,
      highlightType: "Practical barrier",
      severity: "Medium",
      title: "Housing / transportation need",
      evidenceText: segment.text,
      topic: lower.includes("bus") ? "Transportation" : "Housing stability",
      sentimentLabel: "mixed",
      emotionLabel: "Stress",
      suggestedFocus: "Clarify the barrier, resource need, and client-preferred next step.",
      suggestedTechnique: "Collaborative problem solving",
      suggestedLanguage: "Let us identify the smallest next step and what information you want before taking it.",
      isLive: true,
      isConfirmed: false,
      createdAt
    };
  }
  if (lower.includes("not in danger")) {
    return {
      id: makeId("hl"),
      sessionId: segment.sessionId,
      startTime: segment.startTime,
      endTime: segment.endTime,
      highlightType: "Safety-like statement",
      severity: "Medium",
      title: "Explicit safety-related language",
      evidenceText: segment.text,
      topic: "Safety review",
      sentimentLabel: "unclear",
      emotionLabel: "Overwhelm",
      suggestedFocus: "Flag for practitioner review only. Absence of other statements does not determine risk.",
      suggestedTechnique: "Safety planning referral to practitioner judgment",
      suggestedLanguage: "I want to check directly on safety so we do not rely on assumptions.",
      isLive: true,
      isConfirmed: false,
      createdAt
    };
  }
  return null;
}

export function summarizeTopics(sessionId: string, segments: TranscriptSegment[]): TopicSentimentSummary[] {
  const quotes = segments.map((segment) => segment.text);
  const topics: TopicSentimentSummary[] = [];
  if (quotes.length === 0) return topics;

  if (quotes.some((text) => /rent|housing|eviction|shelter|lease|landlord/i.test(text))) {
    const evidence = quotes.filter((text) => /rent|housing|eviction|shelter|lease|landlord/i.test(text));
    topics.push({
      id: "topic-housing",
      sessionId,
      topic: "Housing stability",
      sentimentLabel: "negative",
      emotionLabels: inferEmotions(evidence),
      intensity: inferIntensity(evidence),
      summary: `Captured language referenced housing stability. Evidence: ${evidence[0]}`,
      evidenceQuotes: evidence,
      recommendedFollowUp: "Clarify the housing concern, urgency, desired next step, and any resource or release needs.",
      suggestedTechnique: "Resource navigation"
    });
  }
  if (quotes.some((text) => /bus|transportation|ride|car|gas|appointment/i.test(text))) {
    const evidence = quotes.filter((text) => /bus|transportation|ride|car|gas|appointment/i.test(text));
    topics.push({
      id: "topic-transport",
      sessionId,
      topic: "Transportation access",
      sentimentLabel: "mixed",
      emotionLabels: inferEmotions(evidence),
      intensity: inferIntensity(evidence),
      summary: `Captured language referenced transportation or appointment access. Evidence: ${evidence[0]}`,
      evidenceQuotes: evidence,
      recommendedFollowUp: "Review transportation options or scheduling supports if available.",
      suggestedTechnique: "Collaborative problem solving"
    });
  }
  if (quotes.some((text) => /trying|overwhelmed|nothing changes|stuck|tired|exhausted|anxious|worried|stress/i.test(text))) {
    const evidence = quotes.filter((text) =>
      /trying|overwhelmed|nothing changes|stuck|tired|exhausted|anxious|worried|stress/i.test(text)
    );
    topics.push({
      id: "topic-discouragement",
      sessionId,
      topic: "Emotional distress / overwhelm",
      sentimentLabel: "negative",
      emotionLabels: inferEmotions(evidence),
      intensity: inferIntensity(evidence),
      summary: `Captured language suggested distress or overwhelm. Evidence: ${evidence[0]}`,
      evidenceQuotes: evidence,
      recommendedFollowUp: "Reflect emotional tone, clarify what feels most pressing, and avoid assuming diagnosis or risk.",
      suggestedTechnique: "Reflective listening"
    });
  }
  if (quotes.some((text) => /job|work|boss|shift|employment|income|benefits|paycheck/i.test(text))) {
    const evidence = quotes.filter((text) => /job|work|boss|shift|employment|income|benefits|paycheck/i.test(text));
    topics.push({
      id: "topic-work-income",
      sessionId,
      topic: "Work / income stability",
      sentimentLabel: inferSentiment(evidence),
      emotionLabels: inferEmotions(evidence),
      intensity: inferIntensity(evidence),
      summary: `Captured language referenced work, income, or benefits. Evidence: ${evidence[0]}`,
      evidenceQuotes: evidence,
      recommendedFollowUp: "Clarify concrete barriers, deadlines, preferences, and support needs.",
      suggestedTechnique: "Solution-focused questioning"
    });
  }
  if (quotes.some((text) => /safe|danger|hurt myself|suicide|kill myself|abuse|violence|threat/i.test(text))) {
    const evidence = quotes.filter((text) => /safe|danger|hurt myself|suicide|kill myself|abuse|violence|threat/i.test(text));
    topics.push({
      id: "topic-safety-review",
      sessionId,
      topic: "Safety-related language",
      sentimentLabel: "unclear",
      emotionLabels: inferEmotions(evidence),
      intensity: "unclear",
      summary: `Captured language may require direct practitioner safety review. Evidence: ${evidence[0]}`,
      evidenceQuotes: evidence,
      recommendedFollowUp: "Assess directly using practitioner judgment; do not infer risk from automated flags.",
      suggestedTechnique: "Safety planning referral to practitioner judgment"
    });
  }
  return topics;
}

export function extractAssessment(segments: TranscriptSegment[]): AssessmentBundle {
  if (segments.length === 0) {
    return {
      clientNeeds: [],
      barriers: [],
      strengths: [],
      goals: [],
      resourceNeeds: [],
      safetyLikeStatements: [],
      mandatedReportingLikeStatements: [],
      followUpTasks: []
    };
  }
  const text = segments.map((segment) => segment.text).join(" ");
  const hasSafetyLike = /not in danger|safe|danger|hurt myself|suicide|kill myself|abuse|violence|threat/i.test(text);
  return {
    clientNeeds: [
      text.match(/rent|housing|eviction|shelter|lease|landlord/i) ? "Housing stability support" : "not discussed",
      text.match(/bus|transportation|ride|car|gas|appointment/i) ? "Transportation or appointment access support" : "not discussed",
      text.match(/job|work|employment|income|benefits|paycheck/i) ? "Work, income, or benefits support" : "not discussed"
    ].filter((item) => item !== "not discussed"),
    barriers: [
      text.match(/behind on rent|eviction|shelter/i) ? "Housing stability barrier" : "",
      text.match(/missed the bus|transportation|ride|car|gas/i) ? "Transportation access barrier" : "",
      text.match(/overwhelmed|stuck|nothing changes|exhausted/i) ? "Emotional overwhelm or discouragement" : "",
      text.match(/work|job|income|benefits|paycheck/i) ? "Work or income-related barrier" : ""
    ].filter(Boolean),
    strengths: [
      text.match(/I could|I can|I will|tomorrow|next step|try/i) ? "Captured language included possible next-step or change-oriented language" : "",
      text.match(/help|support|talk|plan/i) ? "Engaged in support-seeking or planning conversation" : ""
    ].filter(Boolean),
    goals: [
      text.match(/housing office|landlord|rent/i) ? "Clarify housing-related next step" : "",
      text.match(/appointment|transportation|bus|ride/i) ? "Address appointment or transportation access" : "",
      text.match(/job|work|benefits|income/i) ? "Clarify work, income, or benefits next step" : ""
    ].filter(Boolean),
    resourceNeeds: [
      text.match(/rent|housing|eviction|shelter/i) ? "Housing or rental assistance resource, resource not specified" : "",
      text.match(/bus|transportation|ride|car|gas/i) ? "Transportation resource, resource not specified" : "",
      text.match(/benefits|income|food|childcare|legal/i) ? "Social service resource, resource not specified" : ""
    ].filter(Boolean),
    safetyLikeStatements: hasSafetyLike
      ? ["Safety-like language was captured; practitioner must assess directly and verify context."]
      : [],
    mandatedReportingLikeStatements: text.match(/abuse|neglect|violence|minor|elder/i)
      ? ["Possible mandated-reporting-related language was captured for qualified practitioner review only."]
      : [],
    followUpTasks: [
      text.match(/housing|rent|landlord|eviction/i) ? "Clarify housing concern, deadlines, and client-preferred next step." : "",
      text.match(/bus|transportation|ride|appointment/i) ? "Review transportation options and appointment access barriers." : "",
      text.match(/work|job|income|benefits/i) ? "Clarify work, income, or benefits follow-up need." : "",
      hasSafetyLike ? "Practitioner to directly assess safety as appropriate." : ""
    ].filter(Boolean)
  };
}

export function analyzePractitionerTechniques(segments: TranscriptSegment[]): PractitionerTechniqueObservation[] {
  return segments
    .filter((segment) => segment.speakerRole === "Practitioner")
    .slice(0, 4)
    .map((segment) => ({
      id: makeId("tech"),
      startTime: segment.startTime,
      endTime: segment.endTime,
      techniqueType: segment.text.includes("?") ? "Open-ended questions" : "Reflective listening",
      observation: segment.text.includes("?")
        ? "Practitioner invited client choice and focus-setting."
        : "Practitioner reflected effort and emotional tone.",
      evidenceText: segment.text,
      suggestedAlternative: "Continue pairing validation with one concrete next step."
    }));
}

export function generateNotes(
  session: Session,
  segments: TranscriptSegment[],
  highlights: Highlight[],
  topics: TopicSentimentSummary[],
  assessment: AssessmentBundle
): NoteBundle {
  const hasTranscript = segments.length > 0;
  const clientStatements = segments
    .filter((segment) => segment.speakerRole === "Client")
    .map((segment) => segment.editedText ?? segment.text);
  const capturedStatements = segments
    .filter((segment) => segment.speakerRole !== "Practitioner")
    .map((segment) => segment.editedText ?? segment.text);
  const sourceStatements = clientStatements.length ? clientStatements : capturedStatements;
  const practitionerStatements = segments
    .filter((segment) => segment.speakerRole === "Practitioner")
    .map((segment) => segment.editedText ?? segment.text);
  const speakerNeedsConfirmation = hasTranscript && clientStatements.length === 0;
  const safetyText =
    assessment.safetyLikeStatements[0] ??
    "No risk-like statements were identified in the reviewed transcript; practitioner must assess directly.";
  return {
    keyNotes: {
      presentingConcern:
        sourceStatements[0] ??
        "Client concerns were not discussed in the reviewed transcript; practitioner must confirm directly.",
      mainThemes: topics.map((topic) => topic.topic),
      clientNeeds: assessment.clientNeeds,
      barriers: assessment.barriers,
      strengths: assessment.strengths,
      protectiveFactors: hasTranscript ? ["Only include protective factors explicitly confirmed by practitioner."] : [],
      goals: assessment.goals,
      resourcesDiscussed: assessment.resourceNeeds.length ? assessment.resourceNeeds : ["resource not specified"],
      homeworkOrPractice: ["Prepare call questions if client agrees."],
      followUpTasks: assessment.followUpTasks,
      itemsForPractitionerConfirmation: [
        "Confirm accuracy of transcript and speaker roles.",
        speakerNeedsConfirmation ? "Speaker role is not confirmed; verify which statements belong to Client and Practitioner." : "",
        "Confirm any safety-related discussion directly with the client.",
        "Verify resource eligibility, availability, consent, and local requirements."
      ].filter(Boolean)
    },
    generalCaseNote: {
      summary: hasTranscript
        ? `Draft note for ${session.sessionType.toLowerCase()} session based on captured transcript evidence. Topics identified: ${
            topics.map((topic) => topic.topic.toLowerCase()).join(", ") || "no structured topics identified yet"
          }. This draft requires practitioner review.`
        : "No transcript evidence is available yet.",
      clientReported: sourceStatements,
      practitionerActions: practitionerStatements,
      clientResponse: hasTranscript ? ["Client response requires practitioner review against transcript evidence."] : [],
      plan: assessment.followUpTasks
    },
    dapNote: {
      data: sourceStatements.join(" ") || "No transcript evidence captured yet.",
      assessment:
        topics.length > 0
          ? `Captured language included: ${topics.map((topic) => topic.topic).join(", ")}. This is not a diagnosis or risk determination.`
          : "No assessment draft generated beyond transcript capture; practitioner must review.",
      plan: assessment.followUpTasks.join(" ") || "Follow-up plan not discussed in captured transcript."
    },
    psychosocialSummary: {
      presentingNeeds: assessment.clientNeeds.join("; ") || "not discussed",
      emotionalContext:
        topics.find((topic) => topic.topic.includes("Discouragement"))?.summary ?? "Emotional context not discussed.",
      socialContext: "Housing and transportation context noted where explicitly stated.",
      basicNeeds: assessment.resourceNeeds.join("; ") || "not discussed",
      barriers: assessment.barriers.join("; ") || "not discussed",
      strengths: assessment.strengths.join("; ") || "not discussed",
      supports: "Support systems were not assessed in the reviewed transcript.",
      followUpNeeds: assessment.followUpTasks.join("; ")
    },
    resourceReferralPlan: {
      resourceNeeds: assessment.resourceNeeds,
      resourcesDiscussed: assessment.resourceNeeds.length ? assessment.resourceNeeds : ["resource not specified"],
      referralsDiscussed: ["No named referral was documented in the reviewed transcript."],
      consentOrReleaseItems: ["Practitioner must verify consent and release requirements before referral."],
      nextSteps: assessment.followUpTasks
    },
    followUpTaskList: assessment.followUpTasks,
    topicSentimentSummary: topics,
    optionalBehavioralObservation: {
      Appearance: "Not directly observable from audio-only recording.",
      Behavior: hasTranscript ? "Engaged verbally in the reviewed transcript." : "Not assessed.",
      Speech: "No speech concerns were identified from the transcript text.",
      Mood: inferMoodFromTopics(topics),
      Affect: "Not directly observable from audio-only recording.",
      "Thought process": hasTranscript
        ? "No disorder or impairment inferred; transcript content requires practitioner review."
        : "Not assessed.",
      "Thought content": "Limited to client-reported stressors and needs in the transcript.",
      Perception: "Not assessed.",
      Orientation: "Not assessed.",
      Cognition: "Not assessed.",
      Insight: hasTranscript ? "Requires practitioner review against transcript evidence." : "Not assessed.",
      Judgment: "Not assessed.",
      "Risk / safety":
        safetyText
    },
    highlightedMoments: highlights,
    finalizedAt: undefined
  };
}

function inferSentiment(evidence: string[]): TopicSentimentSummary["sentimentLabel"] {
  const text = evidence.join(" ").toLowerCase();
  if (/good|better|hope|help|relief|okay|able|can|progress/.test(text)) return "mixed";
  if (/bad|worse|stress|overwhelmed|worried|behind|can't|cannot|stuck|tired|danger|hurt/.test(text)) return "negative";
  return "neutral";
}

function inferIntensity(evidence: string[]): TopicSentimentSummary["intensity"] {
  const text = evidence.join(" ").toLowerCase();
  if (/crisis|danger|suicide|kill myself|eviction|homeless|overwhelmed|nothing changes|can't|cannot/.test(text)) {
    return "high";
  }
  if (/worried|stress|behind|missed|hard|stuck|tired/.test(text)) return "medium";
  return "low";
}

function inferEmotions(evidence: string[]): string[] {
  const text = evidence.join(" ").toLowerCase();
  const emotions = [
    /overwhelmed|too much/.test(text) ? "overwhelm" : "",
    /worried|anxious|nervous/.test(text) ? "worry" : "",
    /stuck|nothing changes|trying/.test(text) ? "discouragement" : "",
    /embarrassed|shame/.test(text) ? "embarrassment" : "",
    /angry|frustrated|mad/.test(text) ? "frustration" : "",
    /tired|exhausted/.test(text) ? "fatigue" : "",
    /hope|better|relief/.test(text) ? "hope" : ""
  ].filter(Boolean);
  return emotions.length ? emotions : ["unclear"];
}

function inferMoodFromTopics(topics: TopicSentimentSummary[]): string {
  const emotions = Array.from(new Set(topics.flatMap((topic) => topic.emotionLabels))).filter(
    (emotion) => emotion !== "unclear"
  );
  return emotions.length
    ? `Captured transcript language suggested: ${emotions.join(", ")}. Practitioner must confirm directly.`
    : "Mood not directly assessed; practitioner must confirm client-reported mood.";
}
