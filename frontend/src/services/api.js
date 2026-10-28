
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Get JWT token from localStorage.
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Common API request helper.
 */
async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    isFormData = false,
  } = options;

  const token = getToken();

  const requestHeaders = {
    ...headers,
  };

  // Do not set Content-Type manually for FormData.
  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined && body !== null) {
    requestOptions.body = isFormData
      ? body
      : JSON.stringify(body);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    requestOptions
  );

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data?.detail
        ? data.detail
        : `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}

/**
 * GET request.
 */
export async function get(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request.
 */
export async function post(endpoint, body = null, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body,
  });
}

/**
 * PUT request.
 */
export async function put(endpoint, body = null, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body,
  });
}

/**
 * PATCH request.
 */
export async function patch(endpoint, body = null, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "PATCH",
    body,
  });
}

/**
 * DELETE request.
 */
export async function remove(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "DELETE",
  });
}

/**
 * Upload files using multipart/form-data.
 */
export async function upload(endpoint, formData, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

/**
 * Export API configuration.
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
};

export default {
  get,
  post,
  put,
  patch,
  remove,
  upload,
};
