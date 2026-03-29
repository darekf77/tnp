import { TaonBaseCrudController } from 'taon';
import { TaonBuild } from './taon-build.entity';
export declare class TaonBuildController extends TaonBaseCrudController<TaonBuild> {
    entityClassResolveFn: () => typeof TaonBuild;
}