import { redirect } from 'next/navigation';

/** Legacy / bookmark alias — real page lives at /console */
export default function OutputAliasPage() {
  redirect('/console');
}
