import IMeldRxAuthData from "./IMeldRxAuthData";

const REDIRECT_URL = process.env.EXPO_PUBLIC_REDIRECT_URL ?? "carebuddy://ehr-callback";
const MELDRX_CLIENT_ID = process.env.EXPO_PUBLIC_MELDRX_CLIENT_ID ?? "";
const MELDRX_WORKSPACE_URL = process.env.EXPO_PUBLIC_MELDRX_WORKSPACE_URL ?? "";

// ✅ Define Firebase Authentication & EHR OAuth2 Configuration
export const authConfig: IMeldRxAuthData = {
  clientId: MELDRX_CLIENT_ID,
  workspaceUrl: MELDRX_WORKSPACE_URL,
  scope: ["openid", "fhirUser", "profile", "launch/patient", "user/*.read", "patient/*.*"], // ✅ Converted to an array
  redirectUrl: REDIRECT_URL,

  // ✅ SMART on FHIR Endpoints
  authorizationEndpoint: `${MELDRX_WORKSPACE_URL}/authorize`,
  tokenEndpoint: `${MELDRX_WORKSPACE_URL}/token`,
  revocationEndpoint: `${MELDRX_WORKSPACE_URL}/revoke`,
};