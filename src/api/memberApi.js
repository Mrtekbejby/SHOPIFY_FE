import { USE_MOCK_API } from "../config/apiConfig";
import { mockLists, updateMockLists } from "../mocks/shoppingMocks";

export async function addMemberApi(listId, email) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const newMember = {
      id: "u" + Date.now(),
      email,
      name: email.split("@")[0]
    };

    const updated = mockLists.map((l) =>
      l.id === listId
        ? {
            ...l,
            members: [...l.members, newMember]
          }
        : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === listId);
  }

  return fetch(`/list/${listId}/member/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).then((r) => r.json());
}

export async function removeMemberApi(listId, memberId) {
  if (USE_MOCK_API) {
    await new Promise((res) => setTimeout(res, 150));

    const updated = mockLists.map((l) =>
      l.id === listId
        ? {
            ...l,
            members: l.members.filter((m) => m.id !== memberId)
          }
        : l
    );

    updateMockLists(updated);
    return updated.find((l) => l.id === listId);
  }

  return fetch(`/list/${listId}/member/remove/${memberId}`, {
    method: "DELETE"
  }).then((r) => r.json());
}