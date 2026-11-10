// Technology logos from Devicon (MIT), bundled as files: https://devicon.dev
import html5 from 'devicon/icons/html5/html5-original.svg?url'
import css3 from 'devicon/icons/css3/css3-original.svg?url'
import javascript from 'devicon/icons/javascript/javascript-original.svg?url'
import typescript from 'devicon/icons/typescript/typescript-original.svg?url'
import python from 'devicon/icons/python/python-original.svg?url'
import django from 'devicon/icons/django/django-plain.svg?url'
import fastapi from 'devicon/icons/fastapi/fastapi-original.svg?url'
import react from 'devicon/icons/react/react-original.svg?url'
import vuejs from 'devicon/icons/vuejs/vuejs-original.svg?url'
import nodejs from 'devicon/icons/nodejs/nodejs-original.svg?url'
import java from 'devicon/icons/java/java-original.svg?url'
import kotlin from 'devicon/icons/kotlin/kotlin-original.svg?url'
import swift from 'devicon/icons/swift/swift-original.svg?url'
import cplusplus from 'devicon/icons/cplusplus/cplusplus-original.svg?url'
import csharp from 'devicon/icons/csharp/csharp-original.svg?url'
import go from 'devicon/icons/go/go-original.svg?url'
import php from 'devicon/icons/php/php-original.svg?url'
import flutter from 'devicon/icons/flutter/flutter-original.svg?url'
import postgresql from 'devicon/icons/postgresql/postgresql-original.svg?url'
import mysql from 'devicon/icons/mysql/mysql-original.svg?url'
import docker from 'devicon/icons/docker/docker-original.svg?url'
import git from 'devicon/icons/git/git-original.svg?url'
import github from 'devicon/icons/github/github-original.svg?url'
import linux from 'devicon/icons/linux/linux-original.svg?url'
import tailwindcss from 'devicon/icons/tailwindcss/tailwindcss-original.svg?url'
import bootstrap from 'devicon/icons/bootstrap/bootstrap-original.svg?url'
import figma from 'devicon/icons/figma/figma-original.svg?url'
import arduino from 'devicon/icons/arduino/arduino-original.svg?url'
import unity from 'devicon/icons/unity/unity-original.svg?url'

export interface TechItem {
  id: string
  name: string
  src: string
}

export const TECH_CATALOG: TechItem[] = [
  { id: 'html5', name: 'HTML', src: html5 },
  { id: 'css3', name: 'CSS', src: css3 },
  { id: 'javascript', name: 'JS', src: javascript },
  { id: 'typescript', name: 'TypeScript', src: typescript },
  { id: 'python', name: 'Python', src: python },
  { id: 'django', name: 'Django', src: django },
  { id: 'fastapi', name: 'FastAPI', src: fastapi },
  { id: 'react', name: 'React', src: react },
  { id: 'vuejs', name: 'Vue', src: vuejs },
  { id: 'nodejs', name: 'Node.js', src: nodejs },
  { id: 'java', name: 'Java', src: java },
  { id: 'kotlin', name: 'Kotlin', src: kotlin },
  { id: 'swift', name: 'Swift', src: swift },
  { id: 'cplusplus', name: 'C++', src: cplusplus },
  { id: 'csharp', name: 'C#', src: csharp },
  { id: 'go', name: 'Go', src: go },
  { id: 'php', name: 'PHP', src: php },
  { id: 'flutter', name: 'Flutter', src: flutter },
  { id: 'postgresql', name: 'PostgreSQL', src: postgresql },
  { id: 'mysql', name: 'MySQL', src: mysql },
  { id: 'docker', name: 'Docker', src: docker },
  { id: 'git', name: 'Git', src: git },
  { id: 'github', name: 'GitHub', src: github },
  { id: 'linux', name: 'Linux', src: linux },
  { id: 'tailwindcss', name: 'Tailwind', src: tailwindcss },
  { id: 'bootstrap', name: 'Bootstrap', src: bootstrap },
  { id: 'figma', name: 'Figma', src: figma },
  { id: 'arduino', name: 'Arduino', src: arduino },
  { id: 'unity', name: 'Unity', src: unity },
]

const byId = new Map(TECH_CATALOG.map((t) => [t.id, t]))
export const getTech = (id: string) => byId.get(id)
