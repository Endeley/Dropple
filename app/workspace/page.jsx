"use server";

import { redirect } from "next/navigation";

export default async function WorkspaceIndexRedirect() {
  redirect("/workspace/create");
}
