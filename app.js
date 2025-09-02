// app.js — Single Page 'Grev Management' using AWS SDK v3 (Browser)
// IMPORTANT: You said you'll embed the credentials yourself. Edit AWS_CONFIG below.
// ⚠️ SECURITY: Putting long‑lived keys in browser code is unsafe. Use tightly scoped IAM and CORS.
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "https://esm.sh/@aws-sdk/client-s3@3.645.0";

// ======= EDIT THESE =======
const AWS_CONFIG = {
  region: "ap-south-1",           // e.g., "ap-south-1"
  bucket: "YOUR_BUCKET",          // e.g., "grevstorage"
  accessKeyId: "YOUR_ACCESS_KEY", // e.g., "AKIA..."
  secretAccessKey: "YOUR_SECRET", // e.g., "xxxxxxxx"
  prefix: "grievances/"           // folder/prefix inside the bucket
};
// ==========================

function client() {
  const { region, accessKeyId, secretAccessKey } = AWS_CONFIG;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS_CONFIG values. Open app.js and fill region/bucket/accessKey/secret.");
  }
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });
}

// ---- UI refs
const btnRefresh = document.getElementById("btnRefresh");
const form = document.getElementById("formGrievance");
const submitResult = document.getElementById("submitResult");
const listDiv = document.getElementById("list");

// ---- Helpers
function uid(len = 12) {
  const s = "abcdefghijklmnopqrstuvwxyz0123456789";
  let o = "";
  for (let i = 0; i < len; i++) o += s[Math.floor(Math.random() * s.length)];
  return o;
}
function ts() { return new Date().toISOString(); }
function prefixSafe() {
  const p = (AWS_CONFIG.prefix || "grievances/").replace(/^\/+/, "");
  return p.endsWith("/") ? p : p + "/";
}
function recordKey(id) { return `${prefixSafe()}${id}/record.json`; }
function fileKey(id, name) {
  const safe = String(name || "file").replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${prefixSafe()}${id}/files/${Date.now()}_${safe}`;
}

// ---- Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitResult.textContent = "Uploading to S3...";
  try {
    const c = client();

    const fd = new FormData(form);
    const data = {
      id: uid(),
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      category: String(fd.get("category") || "General"),
      description: String(fd.get("description") || "").trim(),
      created_at: ts(),
      files: []
    };

    if (!data.name || !data.email || !data.description) {
      submitResult.textContent = "Please fill Name, Email, and Description.";
      return;
    }

    const input = form.querySelector('input[name="files"]');
    const files = input?.files || [];
    const maxFiles = Math.min(files.length, 3);

    // Upload up to 3 attachments
    for (let i = 0; i < maxFiles; i++) {
      const f = files[i];
      const k = fileKey(data.id, f.name);
      await c.send(new PutObjectCommand({
        Bucket: AWS_CONFIG.bucket,
        Key: k,
        Body: f,
        ContentType: f.type || "application/octet-stream"
      }));
      data.files.push({ key: k, name: f.name, size: f.size, type: f.type });
    }

    // Upload JSON record
    const body = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    await c.send(new PutObjectCommand({
      Bucket: AWS_CONFIG.bucket,
      Key: recordKey(data.id),
      Body: body,
      ContentType: "application/json"
    }));

    submitResult.innerHTML = `Submitted! ID: <b>${data.id}</b>.<br>Folder: <code>${prefixSafe()}${data.id}/</code>`;
    form.reset();
    await refreshList();
  } catch (err) {
    console.error(err);
    submitResult.textContent = "Failed: " + (err?.message || String(err));
  }
});

// ---- List recent submissions
btnRefresh.onclick = refreshList;

async function refreshList() {
  listDiv.textContent = "Loading...";
  try {
    const c = client();
    const cmd = new ListObjectsV2Command({
      Bucket: AWS_CONFIG.bucket,
      Prefix: prefixSafe(),
      MaxKeys: 1000
    });
    const resp = await c.send(cmd);
    const records = (resp.Contents || []).filter(o => o.Key.endsWith("/record.json"));

    if (!records.length) {
      listDiv.innerHTML = "<p class='muted'>No records found yet.</p>";
      return;
    }
    const html = [];
    for (const obj of records.slice(-20).reverse()) {
      const parts = obj.Key.split("/");
      const id = parts.length > 1 ? parts[1] : "(unknown)";
      html.push(`<div class="item"><b>ID:</b> ${id}<br><b>S3 Key:</b> <code>${obj.Key}</code></div>`);
    }
    listDiv.innerHTML = html.join("");
  } catch (e) {
    listDiv.textContent = "Failed: " + (e?.message || String(e));
  }
}

// Initial load
refreshList().catch(() => {});
