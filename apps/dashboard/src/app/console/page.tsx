import { redirect } from 'next/navigation';

/** Output is now the live terminal docked on Labs. */
export default function ConsoleRedirectPage() {
  redirect('/scenarios');
}
