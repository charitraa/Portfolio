import { BadgeCheck, Clock } from 'lucide-react'
import { Badge, Empty, Panel, View, ViewHeader } from '@/components/ui'
import { certifications } from '@/data/skills'

export function Certifications() {
  const verified = certifications.filter((c) => c.status === 'Verified')
  const inProgress = certifications.filter((c) => c.status === 'In Progress')

  return (
    <View>
      <ViewHeader
        title="Certifications"
        route="GET /api/v1/certifications"
        desc="Credential records. Every verified entry has a lookup id you can check with the issuer."
        actions={
          <>
            <Badge color="green" dot>{verified.length} verified</Badge>
            <Badge color="yellow" dot>{inProgress.length} in progress</Badge>
          </>
        }
      />

      <Panel bodyClass="p-0">
        {certifications.length === 0 && (
          <Empty>
            <div className="text-red">HTTP/1.1 204 No Content</div>
            <div className="mt-2 text-muted">
              No credential records yet — add them in <span className="text-blue">src/data/skills.ts</span>
            </div>
          </Empty>
        )}
        <div className={certifications.length === 0 ? 'hidden' : 'overflow-x-auto'}>
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-bg2">
                {['Credential', 'Issuer', 'Issued', 'Reference', 'Status'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2 text-[10.5px] font-semibold tracking-widest text-muted uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certifications.map((c) => (
                <tr
                  key={c.name}
                  className="border-b border-line-soft transition-colors duration-150 last:border-0 hover:bg-hover"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {c.status === 'Verified' ? (
                        <BadgeCheck size={14} className="shrink-0 text-green" />
                      ) : (
                        <Clock size={14} className="shrink-0 text-yellow" />
                      )}
                      <span className="text-[12.5px] font-medium text-fg">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-fg2">{c.issuer}</td>
                  <td className="num px-3 py-2.5 text-[11.5px] text-muted">{c.date}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted">
                    {c.credential ?? '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge color={c.status === 'Verified' ? 'green' : 'yellow'} dot>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </View>
  )
}
