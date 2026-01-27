//#region imports
import { MulterFileUploadResponse, TaonEntity, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { TaonBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column, String100Column, String45Column, String200Column, NumberColumn, VersionColumn } from 'taon/lib-prod';
import { chalk, dateformat, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { FilePathMetaData__NS__embedData, FilePathMetaData__NS__extractData, FilePathMetaData__NS__getOnlyMetadataString } from 'tnp-core/lib-prod';

import { keysMap } from '../../../../constants';
import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';

import { DeploymentsDefaultsValues } from './deployments.defaults-values';
import { DeploymentReleaseData, DeploymentsStatus } from './deployments.models';

//#endregion

@TaonEntity({
  className: 'Deployments',
})
export class Deployments
  extends TaonBaseEntity<Deployments>
  implements DeploymentReleaseData
{

  //#region @websql
  @PrimaryGeneratedColumn()
  //#endregion

  id: string;

  //#region base file name with hash datetime

  //#region @websql
  @Column({
    type: 'varchar',
    length: 500,
    unique: true,
  })
  //#endregion

  baseFileNameWithHashDatetime?: string;
  //#endregion

  //#region size

  //#region @websql
  @NumberColumn()
  //#endregion

  size: MulterFileUploadResponse['size'];
  //#endregion

  //#region status

  //#region @websql
  @Column({
    type: 'varchar',
    length: 20,
    default: DeploymentsStatus.NOT_STARTED,
  })
  //#endregion

  status: DeploymentsStatus;
  //#endregion

  //#region project name

  //#region @websql
  @String100Column()
  //#endregion

  projectName: string;
  //#endregion

  //#region environment name

  //#region @websql
  @String100Column()
  //#endregion

  envName: CoreModels__NS__EnvironmentNameTaon;
  //#endregion

  //#region environment number

  //#region @websql
  @String45Column()
  //#endregion

  envNumber: string;
  //#endregion

  //#region target artifact

  //#region @websql
  @String45Column()
  //#endregion

  targetArtifact: ReleaseArtifactTaon;
  //#endregion

  //#region target artifact

  //#region @websql
  @String45Column()
  //#endregion

  releaseType: ReleaseType;
  //#endregion

  //#region project version

  //#region @websql
  @VersionColumn()
  //#endregion

  version: string;
  //#endregion

  //#region destination domain

  //#region @websql
  @String200Column()
  //#endregion

  destinationDomain: string;
  //#endregion

  //#region process compose up id

  //#region @websql
  @String45Column()
  //#endregion

  processIdComposeUp?: string | null;
  //#endregion

  //#region process compose down id

  //#region @websql
  @String45Column()
  //#endregion

  processIdComposeDown?: string | null;
  //#endregion

  //#region arrival date

  //#region @websql
  @CreateDateColumn()
  //#endregion

  arrivalDate?: Date;
  //#endregion

  //#region getters / release date
  // get releaseData(): Partial<DeploymentReleaseData> {
  //   const data = FilePathMetaData__NS__extractData<DeploymentReleaseData>(
  //     this.baseFileNameWithHashDatetime,
  //     {
  //       keysMap,
  //     },
  //   );
  //   return data || ({} as Partial<DeploymentReleaseData>);
  // }
  //#endregion

  //#region getters / preview string
  get previewString(): string {
    return (
      `${this.id} ${this.destinationDomain || '<unknown-domain>'} v${this.version} ` +
      `(${this.status}) ` +
      `${this.arrivalDate ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss') : 'unknown date'} `
    );
  }
  //#endregion

  fullPreviewString(options?: { boldValues?: boolean }): string {

    //#region @websqlFunc
    options = options || {};
    const boldValues = !!options.boldValues;
    // const r = this.releaseData;
    let envName = '';
    if (!this.envName) {
      envName = 'unknown environment';
    } else if (this.envName === '__') {
      envName = '< default >';
    } else {
      envName = `${this.envName} ${this.envNumber}`;
    }

    const boldFn = (str: string) => (boldValues ? chalk.bold(str) : str);

    return [
      `Destination domain (${boldFn(this.destinationDomain || '- unknown domain -')})`,
      `Project Name (${boldFn(this.projectName || '- unknown project -')})`,
      `Version (${boldFn(this.version || '- unknown version -')})`,
      `Status (${boldFn(this.status || '- unknown version -')})`,
      `Artifact (${boldFn(this.targetArtifact || '- unknown artifact -')})`,
      `Release Type (${boldFn(this.releaseType || '- unknown release type -')})`,
      `Environment (${boldFn(envName)})`,
      `Arrival Date (${boldFn(
        this.arrivalDate
          ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss')
          : '- unknown date -',
      )})`,
    ].join('\n');
    //#endregion

  }
}