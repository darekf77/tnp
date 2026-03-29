import { TaonBaseAbstractEntity } from 'taon';
export declare class Instances extends TaonBaseAbstractEntity<Instances> {
    /**
     * zip file with docker-compose and other files
     * needed to deploy this deployment
     */
    ipAddress: string;
    name: string;
}