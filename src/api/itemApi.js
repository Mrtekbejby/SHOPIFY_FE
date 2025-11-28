import { API_BASE_URL, USE_MOCK_API } from "../config/apiConfig";
import { mockLists, updateMockLists } from "../mocks/shoppingMocks";

export async function addItemApi(listId, text) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.map((l) =>
      l.id === listId
        ? {
            ...l,
            items: [
              ...l.items,
              { id: "i" + Date.now(), text, completed: false }
            ]
          }
        : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === listId);
  }

  return fetch(`/list/${listId}/item/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then((r) => r.json());
}

export async function toggleItemApi(listId, itemId) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.map((l) =>
      l.id === listId
        ? {
            ...l,
            items: l.items.map((it) =>
              it.id === itemId ? { ...it, completed: !it.completed } : it
            )
          }
        : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === listId);
  }

  return fetch(`/list/${listId}/item/toggle/${itemId}`, {
    method: "POST"
  }).then((r) => r.json());
}

export async function deleteItemApi(listId, itemId) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.map((l) =>
      l.id === listId
        ? {
            ...l,
            items: l.items.filter((it) => it.id !== itemId)
          }
        : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === listId);
  }

  return fetch(`/list/${listId}/item/delete/${itemId}`, {
    method: "DELETE"
  }).then((r) => r.json());
}

export async function renameListApi(id, name) {
    if (USE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 200));
  
      const updated = mockLists.map((l) =>
        l.id === id ? { ...l, name } : l
      );
  
      mockLists = updated;
      return updated.find((l) => l.id === id);
    }
  
    const res = await fetch(`${API_BASE_URL}/list/rename/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
  
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Failed to rename list");
  
    return data;
  }