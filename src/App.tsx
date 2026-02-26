import { useUIStore } from '@/store'
import { AppLayout, NavigationHeader, Sidebar } from '@/components/layout'
import { VisualizerPage } from '@/features/visualizer'
import { TopicsPage } from '@/features/topics'
import { QuestionsPage } from '@/features/questions'

function App() {
  const { viewMode } = useUIStore()

  const renderContent = () => {
    switch (viewMode) {
      case 'visualizer':
        return <VisualizerPage />
      case 'topics':
        return <TopicsPage />
      case 'questions':
        return <QuestionsPage />
      default:
        return <VisualizerPage />
    }
  }

  return (
    <AppLayout
      header={<NavigationHeader />}
      sidebar={<Sidebar />}
    >
      {renderContent()}
    </AppLayout>
  )
}

export default App
