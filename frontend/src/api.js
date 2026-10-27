// api.js - every call to the Express backend goes through here.
export const API_BASE = "http://localhost:5000/api";

// GET a URL and return the parsed JSON, throwing a useful error if it failed.
export async function getJSON(url) {
  const response = await fetch(url);
  const data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.error || "Request failed with status " + response.status);
  }
  return data;
}

// POST / PUT / DELETE with a JSON body.
export async function sendJSON(url, method, body) {
  const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    const message = data.details ? data.details.join(" ") : data.error;
    throw new Error(message || "Request failed with status " + response.status);
  }
  return data;
}
