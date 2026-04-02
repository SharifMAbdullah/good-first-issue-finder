// src/lib/constants/gitlabInstances.ts

export interface GitlabInstance {
  id: string;
  name: string;
  baseUrl: string;
  path?: string;
}

export const KNOWN_GITLAB_INSTANCES: GitlabInstance[] = [
  { id: 'gitlab', name: 'GitLab', baseUrl: 'https://gitlab.com', path: 'gitlab-org' },
  { id: 'gnome', name: 'GNOME', baseUrl: 'https://gitlab.gnome.org' },
  { id: 'debian', name: 'Debian Salsa', baseUrl: 'https://salsa.debian.org' },
  { id: 'kde', name: 'KDE Invent', baseUrl: 'https://invent.kde.org' },
  { id: 'freedesktop', name: 'Freedesktop', baseUrl: 'https://gitlab.freedesktop.org' },
  { id: 'inkscape', name: 'Inkscape', baseUrl: 'https://gitlab.com', path: 'inkscape' }
];