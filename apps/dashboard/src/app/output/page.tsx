import { redirect } from 'next/navigation';

/** Legacy alias — live output lives on Labs. */
export default function OutputAliasPage() {
  redirect('/scenarios');
}
