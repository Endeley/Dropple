"use server";

import { redirect } from "next/navigation";

export default function RedirectTemplateEditor({ params }) {
  const templateId = params?.templateId;
  const target = templateId ? `/workspace/create?templateId=${encodeURIComponent(templateId)}` : "/workspace/create";
  redirect(target);
}
