import { FilePathMetaData } from 'tnp-helpers/lib';

// Example usage
// ----------------------
if (require.main === module) {
  const file = FilePathMetaData.embedData(
    {
      projectName: 'www-domgrubegozwierzaka-pl',
      releaseType: 'manual',
      version: '0.0.8',
      envName: '__',
      envNumber: '',
    },
    'project.zip',
  );

  console.log('Generated:', file);
  // projectName|-|www-domgrubegozwierzaka-pl||--||releaseType|-|manual||--||version|-|0.0.8||--||envName|-|__||--||envNumber-|||.zip

  const meta = FilePathMetaData.extractData<{
    projectName: string;
    releaseType: string;
    version: string;
    envName: string;
    envNumber: string;
  }>(file);

  console.log('Extracted:', meta);
  // {
  //   projectName: 'www-domgrubegozwierzaka-pl',
  //   releaseType: 'manual',
  //   version: '0.0.8',
  //   envName: '__',
  //   envNumber: ''
  // }
}
