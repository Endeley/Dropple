"use server";

import { redirect } from "next/navigation";

export default function RedirectCreate() {
  redirect("/workspace/create");
}
