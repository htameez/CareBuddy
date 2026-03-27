function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

function uniqueTokens(value) {
  return [...new Set(tokenize(value))];
}

function parseIsoDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysAgo(value) {
  const parsed = parseIsoDate(value);
  if (!parsed) return null;

  return Math.max(0, (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
}

function chunkText(text, maxLength = 900) {
  const normalized = String(text || "").trim();
  if (!normalized) return [];

  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const sections = normalized.split(/\n{2,}/).map((section) => section.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  sections.forEach((section) => {
    if (!current) {
      current = section;
      return;
    }

    if (`${current}\n\n${section}`.length <= maxLength) {
      current = `${current}\n\n${section}`;
      return;
    }

    chunks.push(current);
    current = section;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks.length ? chunks : [normalized.slice(0, maxLength)];
}

function scoreText(query, candidate) {
  const queryTokens = uniqueTokens(query);
  const candidateText = normalizeText(candidate);

  let score = 0;
  queryTokens.forEach((token) => {
    if (candidateText.includes(token)) {
      score += token.length > 6 ? 3 : 2;
    }
  });

  return score;
}

function splitNoteIntoSections(noteText) {
  const text = String(noteText || "").trim();
  if (!text) return [];

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections = [];
  let currentHeading = "Clinical note";
  let currentLines = [];

  const pushSection = () => {
    if (!currentLines.length) return;
    sections.push({
      heading: currentHeading,
      text: currentLines.join("\n").trim(),
    });
    currentLines = [];
  };

  lines.forEach((line) => {
    const headingMatch = line.match(/^#+\s*(.+)$/);

    if (headingMatch) {
      pushSection();
      currentHeading = headingMatch[1].trim();
      return;
    }

    if (/^(document type|category|description|author|status|document status|narrative|attachment text|attachment title|attachment content type)\s*:/i.test(line)) {
      pushSection();
      currentHeading = line.split(":")[0].trim();
      currentLines.push(line);
      return;
    }

    currentLines.push(line);
  });

  pushSection();

  return sections.length ? sections : [{ heading: "Clinical note", text }];
}

function queryImpliesRecency(query) {
  const normalized = normalizeText(query);
  return [
    "last",
    "latest",
    "recent",
    "newest",
    "today",
    "current",
    "most recent",
    "previous visit",
    "last visit",
  ].some((phrase) => normalized.includes(phrase));
}

function sectionBonus(query, heading, text) {
  const normalizedQuery = normalizeText(query);
  const normalizedHeading = normalizeText(heading);
  const normalizedText = normalizeText(text);
  let bonus = 0;

  if (
    ["plan", "assessment", "assessment and plan"].some((phrase) => normalizedQuery.includes(phrase)) &&
    ["plan", "assessment"].some((phrase) => normalizedHeading.includes(phrase))
  ) {
    bonus += 8;
  }

  if (
    ["medication", "medicine", "prescribed", "drug"].some((phrase) => normalizedQuery.includes(phrase)) &&
    (normalizedHeading.includes("medication") || normalizedText.includes("prescribed"))
  ) {
    bonus += 6;
  }

  if (
    ["allergy", "allergies"].some((phrase) => normalizedQuery.includes(phrase)) &&
    normalizedHeading.includes("allerg")
  ) {
    bonus += 6;
  }

  if (
    ["chief complaint", "symptom", "complaint", "why did i come", "visit for"].some((phrase) => normalizedQuery.includes(phrase)) &&
    (normalizedHeading.includes("chief complaint") || normalizedHeading.includes("history of present illness"))
  ) {
    bonus += 6;
  }

  return bonus;
}

function recencyBonus(query, date) {
  if (!queryImpliesRecency(query) || !date) return 0;

  const ageInDays = daysAgo(date);
  if (ageInDays === null) return 0;
  if (ageInDays <= 30) return 10;
  if (ageInDays <= 180) return 7;
  if (ageInDays <= 365) return 5;
  return 2;
}

function buildStructuredFacts(user) {
  const medicalHistory = user?.ehr?.medicalHistory || {};
  const demographics = medicalHistory.demographics || {};
  const profile = user?.profile || {};
  const facts = [];

  if (demographics.birthDate || demographics.gender || demographics.ethnicity) {
    facts.push({
      type: "demographics",
      label: "Patient demographics",
      text: `Birth date: ${demographics.birthDate || "Unknown"} | Gender: ${demographics.gender || "Unknown"} | Ethnicity: ${demographics.ethnicity || "Unknown"}`,
    });
  }

  if (profile.age || profile.weight || profile.height || profile.healthGoals) {
    facts.push({
      type: "patient_profile",
      label: "Patient profile",
      text: `Age: ${profile.age || "Unknown"} | Weight: ${profile.weight || "Unknown"} | Height: ${profile.height || "Unknown"} | Health goals: ${profile.healthGoals || "Unknown"}`,
    });
  }

  [
    ["conditions", medicalHistory.conditions || []],
    ["medications", medicalHistory.medications || []],
    ["allergies", medicalHistory.allergies || []],
  ].forEach(([type, values]) => {
    if (Array.isArray(values) && values.length) {
      facts.push({
        type,
        label: `Patient ${type}`,
        text: values.join(", "),
      });
    }
  });

  return facts;
}

function buildClinicalNoteDocuments(user) {
  const notes = Array.isArray(user?.ehr?.medicalHistory?.clinicalNotes)
    ? user.ehr.medicalHistory.clinicalNotes
    : [];

  return notes.flatMap((note, index) => {
    const date = note?.date ? new Date(note.date).toISOString().slice(0, 10) : "Unknown date";
    const noteText = String(note?.note || "").trim();
    const sections = splitNoteIntoSections(noteText);

    return sections.flatMap((section, sectionIndex) =>
      chunkText(section.text).map((chunk, chunkIndex) => ({
        type: "clinical_note",
        label: `Clinical note ${index + 1} - ${section.heading}`,
        section: section.heading,
        date,
        sectionIndex,
        chunkIndex,
        text: `Clinical note date: ${date}\nSection: ${section.heading}\n${chunk}`,
      }))
    );
  });
}

function retrievePatientContext(user, query, options = {}) {
  const maxResults = options.maxResults || 6;
  const structuredFacts = buildStructuredFacts(user);
  const noteDocuments = buildClinicalNoteDocuments(user);

  const candidates = [...structuredFacts, ...noteDocuments].map((candidate) => ({
    ...candidate,
    score:
      scoreText(query, `${candidate.label}\n${candidate.text}`) +
      sectionBonus(query, candidate.section || candidate.label, candidate.text) +
      recencyBonus(query, candidate.date),
  }));

  const ranked = candidates
    .filter((candidate) => candidate.score > 0 || candidate.type !== "clinical_note")
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return {
    structuredFacts,
    noteDocuments,
    ranked,
  };
}

function buildRagContext(user, messages) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message?.role === "user" && typeof message?.content === "string");

  const query = latestUserMessage?.content || "";
  const retrieval = retrievePatientContext(user, query);
  const demographics = user?.ehr?.medicalHistory?.demographics || {};
  const profile = user?.profile || {};

  const patientSummary = [
    `Patient name: ${user?.name || "Unknown"}`,
    `Birth date: ${demographics.birthDate || "Unknown"}`,
    `Gender: ${demographics.gender || "Unknown"}`,
    `Age: ${profile.age || "Unknown"}`,
    `Weight: ${profile.weight || "Unknown"}`,
    `Height: ${profile.height || "Unknown"}`,
    `Health goals: ${profile.healthGoals || "Unknown"}`,
    `EHR last synced: ${user?.ehr?.ehrLastSynced ? new Date(user.ehr.ehrLastSynced).toISOString() : "Unknown"}`,
  ].join("\n");

  const retrievedContext = retrieval.ranked.length
    ? retrieval.ranked
        .map((item, index) => {
          const headerParts = [`[${index + 1}]`, item.label];
          if (item.date) headerParts.push(`Date: ${item.date}`);
          if (item.score) headerParts.push(`Score: ${item.score}`);

          return `${headerParts.join(" | ")}\n${item.text}`;
        })
        .join("\n\n")
    : "No relevant patient context retrieved.";

  return {
    query,
    retrieval,
    promptContext: `Patient summary:\n${patientSummary}\n\nRetrieved patient context:\n${retrievedContext}`,
  };
}

module.exports = { buildRagContext };
