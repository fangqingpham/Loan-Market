import { Button } from "@/components/ui";
import { logoutAction } from "@/app/(auth)/actions";

/** A small form that posts to the logout server action. */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">Log out</Button>
    </form>
  );
}
