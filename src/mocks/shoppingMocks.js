export let mockLists = [
  {
    id: "l1",
    name: "Weekend shopping",
    archived: true,
    ownerId: "u1",
    items: [
      { id: "i1", text: "bread", completed: false },
      { id: "i2", text: "water", completed: true }
    ],
    members: [
      { id: "m1", email: "lucas@gmail.com", name: "lucas" },
      { id: "m2", email: "marie@gmail.com", name: "marie" }
    ]
  },
  {
    id: "l2",
    name: "Birthday party supplies",
    archived: false,
    ownerId: "u1",
    items: [
      { id: "i1", text: "balloons", completed: true },
      { id: "i2", text: "cake", completed: false },
      { id: "i3", text: "cups", completed: true }
    ],
    members: [
      { id: "m1", email: "simon@gmail.com", name: "simon" },
      { id: "m2", email: "anna@gmail.com", name: "anna" },
      { id: "m3", email: "paul@gmail.com", name: "paul" },
      { id: "m4", email: "lucas@gmail.com", name: "lukas" }
    ]
  },
  {
    id: "l3",
    name: "Weekly groceries",
    archived: false,
    ownerId: "u2",
    items: [
      { id: "i1", text: "milk", completed: false },
      { id: "i2", text: "pasta", completed: true },
      { id: "i3", text: "garlic", completed: false },
      { id: "i4", text: "eggs", completed: true },
      { id: "i5", text: "ham", completed: true },
      { id: "i6", text: "water", completed: false },
      { id: "i7", text: "bread", completed: false },
      { id: "i8", text: "apple", completed: true },
      { id: "i9", text: "pork chops", completed: true }
    ],
    members: [
      { id: "m1", email: "sofia@gmail.com", name: "sofia" },
      { id: "m2", email: "emma@gmail.com", name: "emma" },
      { id: "m3", email: "john@gmail.com", name: "john" },
      { id: "m4", email: "adam@gmail.com", name: "adam" },
      { id: "m5", email: "lucas@gmail.com", name: "lukas" }
    ]
  },
  {
    id: "l4",
    name: "Office snacks",
    archived: false,
    ownerId: "u2",
    items: [
      { id: "i1", text: "chips", completed: false },
      { id: "i2", text: "cookies", completed: false },
      { id: "i3", text: "nuts", completed: false },
      { id: "i4", text: "cola", completed: false },
      { id: "i5", text: "energy drink", completed: true },
      { id: "i6", text: "water", completed: false }
    ],
    members: [
      { id: "m1", email: "alex@gmail.com", name: "alex" },
      { id: "m2", email: "misa@gmail.com", name: "misa" },
      { id: "m3", email: "lucas@gmail.com", name: "lukas" }
    ]
  },
  {
    id: "l5",
    name: "Camping trip food list",
    archived: false,
    ownerId: "u1",
    items: [
      { id: "i1", text: "sausages", completed: false },
      { id: "i2", text: "marshmallows", completed: true },
      { id: "i3", text: "bread rolls", completed: false }
    ],
    members: [
      { id: "m1", email: "peter@gmail.com", name: "peter" },
      { id: "m2", email: "nina@gmail.com", name: "nina" },
      { id: "m3", email: "maria@gmail.com", name: "maria" },
      { id: "m4", email: "tom@gmail.com", name: "tom" },
      { id: "m5", email: "sofia@gmail.com", name: "sofia" },
      { id: "m6", email: "lucas@gmail.com", name: "lukas" }
    ]
  }
];

export function updateMockLists(updated) {
  mockLists = updated;
}