import CrewRAGResponseInterface from '@/components/CrewRAGResponseInterface'

export const metadata = {
  title: 'Crew RAG Response - Alex AI Universal',
  description: 'Crew members now speak to the RAG system instead of local documentation',
}

export default function CrewResponsePage() {
  return <CrewRAGResponseInterface />
}
