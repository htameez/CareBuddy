const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REDOX_BASE_URL = process.env.REDOX_BASE_URL || "https://api.redoxengine.com";
const REDOX_DESTINATION_SLUG = process.env.REDOX_DESTINATION_SLUG || "redox-fhir-sandbox";
const REDOX_ENVIRONMENT_FLAG = process.env.REDOX_ENVIRONMENT_FLAG || "Development";

let cachedToken = null;

function getPrivateJwk() {
  if (process.env.REDOX_PRIVATE_JWK) {
    return JSON.parse(process.env.REDOX_PRIVATE_JWK);
  }

  if (process.env.REDOX_PRIVATE_JWK_PATH) {
    const jwkPath = path.resolve(process.env.REDOX_PRIVATE_JWK_PATH);
    return JSON.parse(fs.readFileSync(jwkPath, "utf8"));
  }

  throw new Error("Missing REDOX_PRIVATE_JWK or REDOX_PRIVATE_JWK_PATH");
}

async function createClientAssertion() {
  const jose = await import("jose");
  const clientId = process.env.REDOX_CLIENT_ID;
  const kid = process.env.REDOX_KID;

  if (!clientId) {
    throw new Error("Missing REDOX_CLIENT_ID");
  }

  if (!kid) {
    throw new Error("Missing REDOX_KID");
  }

  const now = Math.floor(Date.now() / 1000);
  const privateKey = await jose.importJWK(getPrivateJwk(), "RS384");

  return new jose.SignJWT({})
    .setProtectedHeader({ alg: "RS384", kid, typ: "JWT" })
    .setAudience(`${REDOX_BASE_URL}/v2/auth/token`)
    .setIssuer(clientId)
    .setSubject(clientId)
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .setJti(crypto.randomBytes(8).toString("hex"))
    .sign(privateKey);
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.REDOX_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing REDOX_CLIENT_ID");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: await createClientAssertion(),
  });

  const response = await fetch(`${REDOX_BASE_URL}/v2/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Redox auth failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 300) * 1000,
  };

  return cachedToken.value;
}

async function redoxFetch(path, { method = "GET", searchParams, body } = {}) {
  const token = await getAccessToken();
  const url = new URL(
    `${REDOX_BASE_URL}/fhir/R4/${REDOX_DESTINATION_SLUG}/${REDOX_ENVIRONMENT_FLAG}${path}`
  );

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/fhir+json",
      "Content-Type": body ? "application/json" : "application/fhir+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Redox FHIR request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

function readCodingText(resourceField) {
  if (!resourceField) return "";
  if (resourceField.text) return resourceField.text;

  if (Array.isArray(resourceField.coding)) {
    const coding = resourceField.coding.find((item) => item.display || item.code);
    return coding?.display || coding?.code || "";
  }

  return "";
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkup(value) {
  return normalizeWhitespace(String(value || "").replace(/<[^>]+>/g, " "));
}

function tryDecodeBase64Text(data) {
  if (!data) return "";

  try {
    const decoded = Buffer.from(data, "base64").toString("utf8");
    return stripMarkup(decoded);
  } catch {
    return "";
  }
}

function extractAttachmentSummary(attachment = {}) {
  const title = normalizeWhitespace(attachment.title);
  const contentType = normalizeWhitespace(attachment.contentType);
  const url = normalizeWhitespace(attachment.url);
  const decodedText = tryDecodeBase64Text(attachment.data);

  const segments = [];

  if (title) segments.push(`Attachment title: ${title}`);
  if (contentType) segments.push(`Attachment content type: ${contentType}`);
  if (decodedText) {
    segments.push(`Attachment text: ${decodedText.slice(0, 4000)}`);
  } else if (url) {
    segments.push(`Attachment URL: ${url}`);
  }

  return segments.join(" | ");
}

function summarizeDocumentReference(resource = {}) {
  const type = readCodingText(resource.type);
  const category = Array.isArray(resource.category)
    ? resource.category.map(readCodingText).filter(Boolean).join(", ")
    : "";
  const description = normalizeWhitespace(resource.description);
  const subjectDisplay = normalizeWhitespace(resource.subject?.display);
  const docStatus = normalizeWhitespace(resource.docStatus);
  const status = normalizeWhitespace(resource.status);
  const narrative = stripMarkup(resource.text?.div || "");
  const authors = Array.isArray(resource.author)
    ? resource.author.map((item) => normalizeWhitespace(item.display || item.reference)).filter(Boolean).join(", ")
    : "";
  const attachments = Array.isArray(resource.content)
    ? resource.content
        .map((item) => extractAttachmentSummary(item?.attachment || {}))
        .filter(Boolean)
        .join(" | ")
    : "";

  return [
    type ? `Document type: ${type}` : "",
    category ? `Category: ${category}` : "",
    description ? `Description: ${description}` : "",
    subjectDisplay ? `Subject: ${subjectDisplay}` : "",
    authors ? `Author: ${authors}` : "",
    status ? `Status: ${status}` : "",
    docStatus ? `Document status: ${docStatus}` : "",
    narrative ? `Narrative: ${narrative.slice(0, 4000)}` : "",
    attachments,
  ]
    .filter(Boolean)
    .join(" | ");
}

function extractPatient(bundle) {
  return bundle?.entry?.[0]?.resource || null;
}

async function findPatient(search) {
  if (search.patientId) {
    return redoxFetch(`/Patient/${encodeURIComponent(search.patientId)}`);
  }

  const searchBody = {
    ...(search.firstName ? { given: search.firstName } : {}),
    ...(search.lastName ? { family: search.lastName } : {}),
    ...(search.birthDate ? { birthdate: search.birthDate } : {}),
    ...(search.mrn ? { identifier: search.mrn } : {}),
  };

  const result = await redoxFetch("/Patient/_search", {
    method: "POST",
    body: searchBody,
  });

  return extractPatient(result);
}

async function fetchPatientResources(patientId) {
  const [conditionsBundle, medicationsBundle, allergiesBundle, documentsBundle] =
    await Promise.all([
      redoxFetch("/Condition", { searchParams: { patient: patientId } }),
      redoxFetch("/MedicationRequest", { searchParams: { patient: patientId } }),
      redoxFetch("/AllergyIntolerance", { searchParams: { patient: patientId } }),
      redoxFetch("/DocumentReference", { searchParams: { patient: patientId } }),
    ]);

  return {
    conditions:
      conditionsBundle?.entry
        ?.map((entry) => readCodingText(entry.resource?.code))
        .filter(Boolean) || [],
    medications:
      medicationsBundle?.entry
        ?.map((entry) =>
          readCodingText(entry.resource?.medicationCodeableConcept) ||
          readCodingText(entry.resource?.medicationReference)
        )
        .filter(Boolean) || [],
    allergies:
      allergiesBundle?.entry
        ?.map((entry) => readCodingText(entry.resource?.code))
        .filter(Boolean) || [],
    clinicalNotes:
      documentsBundle?.entry
        ?.map((entry) => entry.resource)
        .filter(Boolean) || [],
  };
}

async function fetchDocumentReferencesDebug(search, limit = 5) {
  const patient = await findPatient(search);

  if (!patient?.id) {
    throw new Error("Patient not found in Redox destination.");
  }

  const documentsBundle = await redoxFetch("/DocumentReference", {
    searchParams: { patient: patient.id },
  });

  const references =
    documentsBundle?.entry
      ?.map((entry) => entry.resource)
      .filter(Boolean)
      .slice(0, limit) || [];

  const documents = await Promise.all(
    references.map(async (documentReference) => {
      let detailedResource = documentReference;

      if (documentReference?.id) {
        try {
          detailedResource = await redoxFetch(
            `/DocumentReference/${encodeURIComponent(documentReference.id)}`
          );
        } catch (error) {
          return {
            id: documentReference.id,
            readError: error.message,
            searchResource: documentReference,
          };
        }
      }

      return {
        id: detailedResource?.id || documentReference?.id,
        summary: summarizeDocumentReference(detailedResource || documentReference || {}),
        searchResource: documentReference,
        detailedResource,
      };
    })
  );

  return {
    patientId: patient.id,
    totalSearchResults: documentsBundle?.entry?.length || 0,
    returnedDocuments: documents.length,
    documents,
  };
}

async function fetchRedoxEHRData(search) {
  const patient = await findPatient(search);

  if (!patient?.id) {
    throw new Error("Patient not found in Redox destination.");
  }

  const demographics = {
    birthDate: patient.birthDate || "",
    gender: patient.gender || "",
    ethnicity:
      patient.extension?.find((ext) =>
        String(ext.url || "").toLowerCase().includes("ethnicity")
      )?.valueString || "",
  };

  const resources = await fetchPatientResources(patient.id);
  const clinicalNotes = await Promise.all(
    resources.clinicalNotes.map(async (documentReference) => {
      let detailedResource = documentReference;

      if (documentReference?.id) {
        try {
          detailedResource = await redoxFetch(
            `/DocumentReference/${encodeURIComponent(documentReference.id)}`
          );
        } catch {
          detailedResource = documentReference;
        }
      }

      const summary = summarizeDocumentReference(detailedResource || documentReference || {});

      return {
        date:
          detailedResource?.date ||
          documentReference?.date ||
          detailedResource?.meta?.lastUpdated ||
          documentReference?.meta?.lastUpdated ||
          new Date().toISOString(),
        note: summary || "Clinical note metadata available in Epic via Redox.",
      };
    })
  );

  return {
    patientID: patient.id,
    demographics,
    conditions: resources.conditions,
    medications: resources.medications,
    allergies: resources.allergies,
    clinicalNotes,
  };
}

module.exports = { fetchRedoxEHRData, fetchDocumentReferencesDebug };
