export default interface IMeldRxAuthData {
    clientId: string;
    workspaceUrl: string;
    scope: string[];
    redirectUrl: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint: string;
}    