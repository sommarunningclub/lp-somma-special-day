import { redirect } from 'next/navigation'

// Atalho de marca: /somma-connect -> app.
export default function SommaConnectAlias() {
  redirect('/tracking/gps-somma')
}
