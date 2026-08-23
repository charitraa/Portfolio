import { Link, useLocation } from 'react-router-dom'
import { Button, Panel, View } from '@/components/ui'

export function NotFound() {
  const { pathname } = useLocation()

  return (
    <View>
      <Panel title="Error" subtitle="text/plain">
        <pre className="font-mono text-[12px] leading-relaxed">
          <span className="text-red">HTTP/1.1 404 Not Found</span>
          {'\n'}
          <span className="text-muted">request-path: </span>
          <span className="text-fg2">{pathname}</span>
          {'\n'}
          <span className="text-muted">hint: </span>
          <span className="text-fg2">this route is not part of the workspace</span>
        </pre>
        <div className="mt-4 flex gap-2">
          <Link to="/dashboard">
            <Button variant="primary">Back to dashboard</Button>
          </Link>
          <Link to="/projects">
            <Button>Browse projects</Button>
          </Link>
        </div>
      </Panel>
    </View>
  )
}
