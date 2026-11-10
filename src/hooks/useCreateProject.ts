import { useNavigate } from 'react-router'
import { useProjectStore } from '../store/projectStore'
import { documentFromTemplate } from '../templates/build'
import { getTemplate } from '../templates'
import { applyBrandKit } from '../store/brandStore'

export function useCreateProject() {
  const navigate = useNavigate()
  const createProject = useProjectStore((s) => s.createProject)
  return (templateId: string) => {
    const template = getTemplate(templateId)
    const doc = documentFromTemplate(template)
    const project = createProject({ ...doc, fields: applyBrandKit(doc.fields) }, template.name)
    navigate(`/editor/${project.id}`)
  }
}
