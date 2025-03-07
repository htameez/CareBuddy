import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MELDRX_WORKSPACE_URL = process.env.EXPO_PUBLIC_MELDRX_WORKSPACE_URL ?? "";

export const fetchEHRData = async () => {
  try {
    // ✅ 1. Retrieve Access Token
    const accessToken = await AsyncStorage.getItem("ehr_access_token");
    if (!accessToken) throw new Error("No access token found");

    const headers = { Authorization: `Bearer ${accessToken}` };

    // ✅ 2. Fetch Patient Demographics
    const patientResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/Patient`, { headers });
    const patient = patientResponse.data.entry?.[0]?.resource;

    if (!patient?.id) throw new Error("No patient ID found in EHR data");

    // ✅ Extract patient demographics
    const demographics = {
      birthDate: patient?.birthDate || "",
      gender: patient?.gender || "",
      ethnicity: patient?.extension?.find((ext: { url: string }) =>
        ext.url.includes("ethnicity")
      )?.valueString || "",
    };

    // ✅ 3. Fetch Medical Data (Helper Function)
    const fetchEHRList = async (endpoint: string, field: string) => {
      try {
        const response = await axios.get(`${MELDRX_WORKSPACE_URL}/${endpoint}?patient=${patient.id}`, { headers });
        return response.data.entry?.map((entry: any) => entry.resource[field]?.text || "") || [];
      } catch (error) {
        console.error(`❌ Failed to fetch ${endpoint}:`, error);
        return [];
      }
    };

    // ✅ 4. Fetch Medical History Data
    const conditions = await fetchEHRList("Condition", "code");
    const medications = await fetchEHRList("MedicationRequest", "medicationCodeableConcept");
    const allergies = await fetchEHRList("AllergyIntolerance", "code");

    // ✅ 5. Fetch Clinical Notes
    let clinicalNotes = [];
    try {
      const notesResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/DocumentReference?patient=${patient.id}`, { headers });
      clinicalNotes = notesResponse.data.entry?.map((entry: any) => ({
        date: entry.resource.date || "",
        note: entry.resource.text?.div?.replace(/<[^>]+>/g, "") || "", // Remove HTML tags
      })) || [];
    } catch (error) {
      console.error("❌ Failed to fetch clinical notes:", error);
    }

    // ✅ 6. Return Standardized Data Object
    return {
      patientID: patient.id,
      demographics,
      conditions,
      medications,
      allergies,
      clinicalNotes,
    };
  } catch (error) {
    console.error("❌ Error fetching EHR data:", error);
    return null;
  }
};