import { API_URL } from "./constants";

interface ApiOptions extends RequestInit {
  data?: any;
  isForm?: boolean;
  formData?: FormData;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { data, isForm, formData, ...customOptions } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("hb_token") : null;

  const headers: Record<string, string> = {
    ...((customOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body = customOptions.body;
  if (formData) {
    // Do NOT set Content-Type — browser sets it with correct multipart boundary
    body = formData as any;
  } else if (data) {
    if (isForm) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      body = new URLSearchParams(data).toString();
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...customOptions,
      headers,
      body,
    });

    const status = response.status;
    
    // For 204 No Content, there is no body to parse
    if (status === 204) {
      return { data: null, error: null, status };
    }

    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      let errorMessage = "An error occurred";
      if (responseData?.detail) {
        if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map((e: any) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(", ");
        } else if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else {
          errorMessage = JSON.stringify(responseData.detail);
        }
      } else if (responseData?.message) {
        errorMessage = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message);
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
      
      return { data: null, error: errorMessage, status };
    }

    return { data: responseData, error: null, status };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network error",
      status: 0,
    };
  }
}
