"use server";

import { redirect } from "next/navigation";

export default function RedirectTemplatesDashboard() {
  redirect("/templates");
}
