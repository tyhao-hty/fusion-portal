import { redirect } from "next/navigation";

export default function HomeRedirect() {
  // Root path now forwards to the static site.
  redirect("/site");
}
