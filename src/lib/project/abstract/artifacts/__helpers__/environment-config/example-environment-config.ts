import { Models } from '../../../../../models';

export const config: Models.EnvConfig = {
  workspace: {
    workspace: {
      baseUrl: '/info',
      name: 'workspace-name',
      port: 5000,
    },
    projects: [
      {
        baseUrl: '/some-api-endpoint',
        name: 'project-name-in-workspace',
        port: 3000,
      },
      {
        baseUrl: '/',
        name: 'other-example-projet-name',
        port: 4000,
      },
    ],
  },
};
