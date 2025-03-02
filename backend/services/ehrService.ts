import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MELDRX_WORKSPACE_URL = process.env.MELDRX_WORKSPACE_URL ?? "";

export const fetchEHRData = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("ehr_access_token");
    if (!accessToken) throw new Error("No access token found");

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Fetch Patient Demographics
    const patientResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/Patient`, { headers });
    const patient = patientResponse.data.entry?.[0]?.resource;

    if (!patient?.id) throw new Error("No patient ID found in EHR data");

    // Fetch Medications
    const medsResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/MedicationRequest?patient=${patient.id}`, { headers });
    const medications = medsResponse.data.entry?.map((entry: { resource: any; }) => entry.resource) || [];

    // Fetch Allergies
    const allergiesResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/AllergyIntolerance?patient=${patient.id}`, { headers });
    const allergies = allergiesResponse.data.entry?.map((entry: { resource: any; }) => entry.resource) || [];

    // Fetch Conditions
    const conditionsResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/Condition?patient=${patient.id}`, { headers });
    const conditions = conditionsResponse.data.entry?.map((entry: { resource: any; }) => entry.resource) || [];

    // Fetch Clinical Notes (DocumentReference)
    const notesResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/DocumentReference?patient=${patient.id}`, { headers });
    const clinicalNotes = notesResponse.data.entry?.map((entry: { resource: { date: any; text: { div: string; }; }; }) => ({
      date: entry.resource.date,
      note: entry.resource.text?.div?.replace(/<[^>]+>/g, ""), // Remove HTML tags
    })) || [];

    return { patient, medications, allergies, conditions, clinicalNotes };
  } catch (error) {
    console.error("❌ Error fetching EHR data:", error);
    return null;
  }
};