import { API_BASE_URL, USE_MOCK_API } from "../config/apiConfig";
import { mockLists, updateMockLists } from "../mocks/shoppingMocks";

export async function fetchLists() {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 300));
    return mockLists; 
  }

  const res = await fetch(`${API_BASE_URL}/list/get`, {
    headers: { Accept: "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Failed to load lists (${res.status})`);
  }

  return res.json();
}

export async function createList(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 200));
    const newList = {
      id: "l" + Date.now(),
      name: trimmed,
      archived: false,
      items: [],
      members: [],
      ownerId: "u1"
    };

    updateMockLists([...mockLists, newList]);
    return newList;
  }

  const res = await fetch(`${API_BASE_URL}/list/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed })
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Failed to create list (${res.status})`);

  return data;
}

export async function archiveListApi(id) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.map((l) =>
      l.id === id ? { ...l, archived: true } : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === id);
  }

  const res = await fetch(`${API_BASE_URL}/list/archive/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Failed to archive list (${res.status})`);

  return data;
}

export async function deleteListApi(id) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.filter((l) => l.id !== id);
    updateMockLists(updated);

    return true;
  }

  const res = await fetch(`${API_BASE_URL}/list/delete/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error(`Failed to delete list (${res.status})`);
  return true;
}

export async function renameListApi(id, name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 200));

    const updated = mockLists.map((l) =>
      l.id === id ? { ...l, name: trimmed } : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === id);
  }

  const res = await fetch(`${API_BASE_URL}/list/rename/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed })
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Failed to rename list");

  return data;
}