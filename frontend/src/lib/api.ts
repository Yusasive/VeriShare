// ----------- NFT Badge -----------
export async function getOrgNftBadge(
  address: string
): Promise<ApiResult<{ tokenId: string; imageUrl: string; uri: string }>> {
  return request(`/api/organization/${address}/nft-badge`);
}
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ----------- Utility Functions -----------
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("verishare.jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts.headers ? Object.fromEntries(Object.entries(opts.headers)) : {}),
    };

    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    const text = await res.text();

    // Safely parse JSON if available
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = {};
    }

    //  Type-safe extraction of `error` field
    const getErrorMessage = (data: unknown): string | undefined => {
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as Record<string, unknown>).error === "string"
      ) {
        return (data as Record<string, string>).error;
      }
      return undefined;
    };

    if (!res.ok) {
      const errorMsg = getErrorMessage(json) ?? text ?? `HTTP ${res.status}`;
      return { ok: false, error: errorMsg, status: res.status };
    }

    return { ok: true, data: json as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

// ----------- Auth -----------
export async function authRegister(body: {
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  authSecretHash: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
  metadata?: Record<string, unknown>;
}): Promise<ApiResult<{ message: string }>> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function authChallenge(address: string): Promise<
  ApiResult<{
    requestId: string;
    address: string;
    nonce: string;
    expiresAt: string;
  }>
> {
  return request("/api/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export async function authVerify(
  address: string,
  signature: string
): Promise<ApiResult<{ token: string; expiresIn: string }>> {
  return request("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ address, signature }),
  });
}

// ----------- EVM Auth -----------
export async function authEvmRegister(body: { address: string; chainId?: string; metadata?: Record<string, unknown> }): Promise<ApiResult<{ message: string; wallet: { id: string; address: string } }>> {
  return request("/api/auth/evm/register", { method: "POST", body: JSON.stringify(body) });
}
export async function authEvmChallenge(address: string): Promise<ApiResult<{ requestId: string; address: string; nonce: string; expiresAt: string }>> {
  return request("/api/auth/evm/challenge", { method: "POST", body: JSON.stringify({ address }) });
}
export async function authEvmVerify(address: string, signature: string): Promise<ApiResult<{ token: string; expiresIn: string }>> {
  return request("/api/auth/evm/verify", { method: "POST", body: JSON.stringify({ address, signature }) });
}
export async function getEvmMe(): Promise<ApiResult<{ wallet: { address: string } }>> {
  return request("/api/auth/evm/me", { headers: authHeaders() });
}

// ----------- JWT Helpers -----------
export function setJwt(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("verishare.jwt", token);
  }
}

export function getJwt(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("verishare.jwt") ?? "";
}

export function clearJwt(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("verishare.jwt");
  }
}

export async function getMe(): Promise<
  ApiResult<{ wallet: { address: string } }>
> {
  const primary = await request<{ wallet: { address: string } }>("/api/auth/me", { headers: authHeaders() });
  if (primary.ok) return primary;
  const evm = await getEvmMe();
  return evm;
}

// ----------- Organization -----------
export async function getOrgProfile(
  address: string
): Promise<ApiResult<{ organization: unknown; onChainVerified: boolean }>> {
  return request(`/api/organization/${address}`);
}

export async function organizationReview(body: {
  address: string;
  status: "approved" | "rejected";
  reviewNotes?: string;
  metadata?: Record<string, unknown>;
}): Promise<ApiResult<{ message: string; organization: unknown }>> {
  return request(`/api/organization/review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

// ----------- EVM -----------
export async function getOrgVerified(
  address: string
): Promise<ApiResult<{ success: boolean; verified: boolean }>> {
  return request(`/api/evm/org/verified/${address}`);
}

export async function revokeShare(
  shareId: string
): Promise<ApiResult<{ success: boolean; txHash?: string }>> {
  return request(`/api/evm/share/revoke`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ shareId }),
  });
}

// ----------- Consent -----------
export async function createConsentRequest(body: {
  credentialId: string;
  ownerAddress: string;
  organizationAddress: string;
  requestedData: unknown[];
  expiresInHours: number;
}): Promise<ApiResult<{ message: string; request: unknown }>> {
  return request(`/api/consent/request`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listConsentForOrg(
  address: string
): Promise<ApiResult<{ count: number; requests: unknown[] }>> {
  return request(`/api/consent/org/${address}`);
}

// ----------- Consent Tokens -----------
export async function issueConsentToken(
  requestId: string,
  expiresInMinutes: number
): Promise<ApiResult<{ message: string; token: string; expiresAt: string }>> {
  return request(`/api/consent/token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ requestId, expiresInMinutes }),
  });
}

export async function revokeConsentToken(
  token: string
): Promise<ApiResult<{ message: string }>> {
  return request(`/api/consent/token/${token}/revoke`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getTokenInfo(token: string): Promise<
  ApiResult<{
    token: string;
    requestId: string;
    organizationAddress: string;
    requestedData: unknown[];
    expiresAt: string;
    status: string;
  }>
> {
  return request(`/api/consent/token/${token}`);
}

export async function redeemToken(
  token: string,
  ownerAddress: string
): Promise<
  ApiResult<{ message: string; request: unknown; ownerAddress: string }>
> {
  return request(`/api/consent/token/${token}/redeem`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ownerAddress }),
  });
}

// ----------- Compliance -----------
export async function getComplianceReport(
  ownerAddress: string,
  periodStart?: string,
  periodEnd?: string
): Promise<ApiResult<{ message: string; report: unknown }>> {
  const qs = new URLSearchParams({
    ownerAddress,
    ...(periodStart ? { periodStart } : {}),
    ...(periodEnd ? { periodEnd } : {}),
  });
  return request(`/api/compliance/report?${qs.toString()}`, {
    headers: authHeaders(),
  });
}
