import { Observable } from 'rxjs';
import type { Instances } from './instances';
import { TaonBaseAngularService } from 'taon';
export declare class InstancesApiService extends TaonBaseAngularService {
    private instancesController;
    get allMyEntities$(): Observable<Instances[]>;
}