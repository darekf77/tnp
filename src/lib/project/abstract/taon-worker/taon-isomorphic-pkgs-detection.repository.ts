//#region imports
import {
  TaonBaseRepository,
  TaonRepository,
  TaonBaseCustomRepository,
  Query,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _, CoreModels } from 'tnp-core/src';
import { Project } from '../project';

//#endregion

@TaonRepository({
  className: 'TaonIsomorphicPkgsDetectionRepository',
})
export class TaonIsomorphicPkgsDetectionRepository extends TaonBaseCustomRepository {
  detectPackagesForContainer = _.debounce(async (nodeModulesPath: string) => {
    const container = Project.ins.From(nodeModulesPath);
    await container.packagesRecognition.start('debounce search');
    // container.
  });
}
