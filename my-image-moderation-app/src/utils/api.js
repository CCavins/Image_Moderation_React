// src/utils/api.js

export async function fetchImages(type = "new") {
  const res = await fetch(`/api/list-${type}`);
  return await res.json();
}

export const moveImage = async (filename, status) => {
  try {
    const response = await fetch('http://localhost:3000/api/move-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to move image');
    }

    return response;
  } catch (error) {
    console.error('Error moving image:', error);
    throw error;
  }
};

export async function syncJsonToFolders() {
  return await fetch("/api/sync-json-to-folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
}

export async function syncFoldersToJson() {
  return await fetch("/api/sync-folders-to-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
}

export async function fetchSettings() {
  const res = await fetch("/api/settings");
  return await res.json();
}

export async function updateSettings(newSettings) {
  return await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSettings)
  });
}

export async function triggerRescan() {
  const res = await fetch("/api/rescan", { method: "POST" });
  return await res.json();
}
