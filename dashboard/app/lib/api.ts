const API = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function parseOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export async function getStats() {
  const res = await fetch(`${API}/stats`);
  return parseOrThrow(res);
}

export async function getProspects() {
  const res = await fetch(`${API}/prospects`);
  return parseOrThrow(res);
}

export async function importExcel(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API}/import`, {
    method: "POST",
    body: form,
  });

  return parseOrThrow(res);
}

export async function getCampaigns() {
  const res = await fetch(`${API}/campaign/list`);
  return parseOrThrow(res);
}

export async function startCampaign(id: number) {
  const res = await fetch(`${API}/campaign/${id}/start`, {
    method: "POST",
  });
  return parseOrThrow(res);
}

export async function startDefaultCampaign() {
  const res = await fetch(`${API}/campaign/start-default`, {
    method: "POST",
  });
  return parseOrThrow(res);
}

export async function createCampaign(data: {
  name: string;
  subject: string;
  template?: string;
}) {
  const res = await fetch(`${API}/campaign/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}