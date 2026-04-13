
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model TaxiManager
 * 
 */
export type TaxiManager = $Result.DefaultSelection<Prisma.$TaxiManagerPayload>
/**
 * Model Driver
 * 
 */
export type Driver = $Result.DefaultSelection<Prisma.$DriverPayload>
/**
 * Model Booking
 * 
 */
export type Booking = $Result.DefaultSelection<Prisma.$BookingPayload>
/**
 * Model DriverReview
 * 
 */
export type DriverReview = $Result.DefaultSelection<Prisma.$DriverReviewPayload>
/**
 * Model ManagerInvite
 * 
 */
export type ManagerInvite = $Result.DefaultSelection<Prisma.$ManagerInvitePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const VehicleType: {
  SEDAN: 'SEDAN',
  MINIVAN: 'MINIVAN',
  WHEELCHAIR_VAN: 'WHEELCHAIR_VAN',
  OTHER: 'OTHER'
};

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType]


export const DriverStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus]


export const DisabilityType: {
  WHEELCHAIR: 'WHEELCHAIR',
  VISUAL: 'VISUAL',
  HEARING: 'HEARING',
  MOBILITY: 'MOBILITY',
  OTHER: 'OTHER'
};

export type DisabilityType = (typeof DisabilityType)[keyof typeof DisabilityType]


export const BookingStatus: {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

}

export type VehicleType = $Enums.VehicleType

export const VehicleType: typeof $Enums.VehicleType

export type DriverStatus = $Enums.DriverStatus

export const DriverStatus: typeof $Enums.DriverStatus

export type DisabilityType = $Enums.DisabilityType

export const DisabilityType: typeof $Enums.DisabilityType

export type BookingStatus = $Enums.BookingStatus

export const BookingStatus: typeof $Enums.BookingStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more TaxiManagers
 * const taxiManagers = await prisma.taxiManager.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more TaxiManagers
   * const taxiManagers = await prisma.taxiManager.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.taxiManager`: Exposes CRUD operations for the **TaxiManager** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TaxiManagers
    * const taxiManagers = await prisma.taxiManager.findMany()
    * ```
    */
  get taxiManager(): Prisma.TaxiManagerDelegate<ExtArgs>;

  /**
   * `prisma.driver`: Exposes CRUD operations for the **Driver** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Drivers
    * const drivers = await prisma.driver.findMany()
    * ```
    */
  get driver(): Prisma.DriverDelegate<ExtArgs>;

  /**
   * `prisma.booking`: Exposes CRUD operations for the **Booking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.booking.findMany()
    * ```
    */
  get booking(): Prisma.BookingDelegate<ExtArgs>;

  /**
   * `prisma.driverReview`: Exposes CRUD operations for the **DriverReview** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DriverReviews
    * const driverReviews = await prisma.driverReview.findMany()
    * ```
    */
  get driverReview(): Prisma.DriverReviewDelegate<ExtArgs>;

  /**
   * `prisma.managerInvite`: Exposes CRUD operations for the **ManagerInvite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ManagerInvites
    * const managerInvites = await prisma.managerInvite.findMany()
    * ```
    */
  get managerInvite(): Prisma.ManagerInviteDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    TaxiManager: 'TaxiManager',
    Driver: 'Driver',
    Booking: 'Booking',
    DriverReview: 'DriverReview',
    ManagerInvite: 'ManagerInvite'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "taxiManager" | "driver" | "booking" | "driverReview" | "managerInvite"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      TaxiManager: {
        payload: Prisma.$TaxiManagerPayload<ExtArgs>
        fields: Prisma.TaxiManagerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaxiManagerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaxiManagerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          findFirst: {
            args: Prisma.TaxiManagerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaxiManagerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          findMany: {
            args: Prisma.TaxiManagerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>[]
          }
          create: {
            args: Prisma.TaxiManagerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          createMany: {
            args: Prisma.TaxiManagerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaxiManagerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>[]
          }
          delete: {
            args: Prisma.TaxiManagerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          update: {
            args: Prisma.TaxiManagerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          deleteMany: {
            args: Prisma.TaxiManagerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaxiManagerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TaxiManagerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaxiManagerPayload>
          }
          aggregate: {
            args: Prisma.TaxiManagerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTaxiManager>
          }
          groupBy: {
            args: Prisma.TaxiManagerGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaxiManagerGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaxiManagerCountArgs<ExtArgs>
            result: $Utils.Optional<TaxiManagerCountAggregateOutputType> | number
          }
        }
      }
      Driver: {
        payload: Prisma.$DriverPayload<ExtArgs>
        fields: Prisma.DriverFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DriverFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DriverFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findFirst: {
            args: Prisma.DriverFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DriverFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findMany: {
            args: Prisma.DriverFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          create: {
            args: Prisma.DriverCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          createMany: {
            args: Prisma.DriverCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DriverCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          delete: {
            args: Prisma.DriverDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          update: {
            args: Prisma.DriverUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          deleteMany: {
            args: Prisma.DriverDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DriverUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DriverUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          aggregate: {
            args: Prisma.DriverAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDriver>
          }
          groupBy: {
            args: Prisma.DriverGroupByArgs<ExtArgs>
            result: $Utils.Optional<DriverGroupByOutputType>[]
          }
          count: {
            args: Prisma.DriverCountArgs<ExtArgs>
            result: $Utils.Optional<DriverCountAggregateOutputType> | number
          }
        }
      }
      Booking: {
        payload: Prisma.$BookingPayload<ExtArgs>
        fields: Prisma.BookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findFirst: {
            args: Prisma.BookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findMany: {
            args: Prisma.BookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          create: {
            args: Prisma.BookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          createMany: {
            args: Prisma.BookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BookingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          delete: {
            args: Prisma.BookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          update: {
            args: Prisma.BookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          deleteMany: {
            args: Prisma.BookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          aggregate: {
            args: Prisma.BookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBooking>
          }
          groupBy: {
            args: Prisma.BookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookingGroupByOutputType>[]
          }
          count: {
            args: Prisma.BookingCountArgs<ExtArgs>
            result: $Utils.Optional<BookingCountAggregateOutputType> | number
          }
        }
      }
      DriverReview: {
        payload: Prisma.$DriverReviewPayload<ExtArgs>
        fields: Prisma.DriverReviewFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DriverReviewFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DriverReviewFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          findFirst: {
            args: Prisma.DriverReviewFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DriverReviewFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          findMany: {
            args: Prisma.DriverReviewFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>[]
          }
          create: {
            args: Prisma.DriverReviewCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          createMany: {
            args: Prisma.DriverReviewCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DriverReviewCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>[]
          }
          delete: {
            args: Prisma.DriverReviewDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          update: {
            args: Prisma.DriverReviewUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          deleteMany: {
            args: Prisma.DriverReviewDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DriverReviewUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DriverReviewUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverReviewPayload>
          }
          aggregate: {
            args: Prisma.DriverReviewAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDriverReview>
          }
          groupBy: {
            args: Prisma.DriverReviewGroupByArgs<ExtArgs>
            result: $Utils.Optional<DriverReviewGroupByOutputType>[]
          }
          count: {
            args: Prisma.DriverReviewCountArgs<ExtArgs>
            result: $Utils.Optional<DriverReviewCountAggregateOutputType> | number
          }
        }
      }
      ManagerInvite: {
        payload: Prisma.$ManagerInvitePayload<ExtArgs>
        fields: Prisma.ManagerInviteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ManagerInviteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ManagerInviteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          findFirst: {
            args: Prisma.ManagerInviteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ManagerInviteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          findMany: {
            args: Prisma.ManagerInviteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>[]
          }
          create: {
            args: Prisma.ManagerInviteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          createMany: {
            args: Prisma.ManagerInviteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ManagerInviteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>[]
          }
          delete: {
            args: Prisma.ManagerInviteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          update: {
            args: Prisma.ManagerInviteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          deleteMany: {
            args: Prisma.ManagerInviteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ManagerInviteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ManagerInviteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ManagerInvitePayload>
          }
          aggregate: {
            args: Prisma.ManagerInviteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateManagerInvite>
          }
          groupBy: {
            args: Prisma.ManagerInviteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ManagerInviteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ManagerInviteCountArgs<ExtArgs>
            result: $Utils.Optional<ManagerInviteCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TaxiManagerCountOutputType
   */

  export type TaxiManagerCountOutputType = {
    bookings: number
  }

  export type TaxiManagerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | TaxiManagerCountOutputTypeCountBookingsArgs
  }

  // Custom InputTypes
  /**
   * TaxiManagerCountOutputType without action
   */
  export type TaxiManagerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManagerCountOutputType
     */
    select?: TaxiManagerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TaxiManagerCountOutputType without action
   */
  export type TaxiManagerCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }


  /**
   * Count Type DriverCountOutputType
   */

  export type DriverCountOutputType = {
    bookings: number
    reviews: number
  }

  export type DriverCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | DriverCountOutputTypeCountBookingsArgs
    reviews?: boolean | DriverCountOutputTypeCountReviewsArgs
  }

  // Custom InputTypes
  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverCountOutputType
     */
    select?: DriverCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }

  /**
   * DriverCountOutputType without action
   */
  export type DriverCountOutputTypeCountReviewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverReviewWhereInput
  }


  /**
   * Models
   */

  /**
   * Model TaxiManager
   */

  export type AggregateTaxiManager = {
    _count: TaxiManagerCountAggregateOutputType | null
    _min: TaxiManagerMinAggregateOutputType | null
    _max: TaxiManagerMaxAggregateOutputType | null
  }

  export type TaxiManagerMinAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type TaxiManagerMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    isActive: boolean | null
    createdAt: Date | null
  }

  export type TaxiManagerCountAggregateOutputType = {
    id: number
    userId: number
    firstName: number
    lastName: number
    phone: number
    isActive: number
    createdAt: number
    _all: number
  }


  export type TaxiManagerMinAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    phone?: true
    isActive?: true
    createdAt?: true
  }

  export type TaxiManagerMaxAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    phone?: true
    isActive?: true
    createdAt?: true
  }

  export type TaxiManagerCountAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    phone?: true
    isActive?: true
    createdAt?: true
    _all?: true
  }

  export type TaxiManagerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaxiManager to aggregate.
     */
    where?: TaxiManagerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxiManagers to fetch.
     */
    orderBy?: TaxiManagerOrderByWithRelationInput | TaxiManagerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaxiManagerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxiManagers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxiManagers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TaxiManagers
    **/
    _count?: true | TaxiManagerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaxiManagerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaxiManagerMaxAggregateInputType
  }

  export type GetTaxiManagerAggregateType<T extends TaxiManagerAggregateArgs> = {
        [P in keyof T & keyof AggregateTaxiManager]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTaxiManager[P]>
      : GetScalarType<T[P], AggregateTaxiManager[P]>
  }




  export type TaxiManagerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaxiManagerWhereInput
    orderBy?: TaxiManagerOrderByWithAggregationInput | TaxiManagerOrderByWithAggregationInput[]
    by: TaxiManagerScalarFieldEnum[] | TaxiManagerScalarFieldEnum
    having?: TaxiManagerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaxiManagerCountAggregateInputType | true
    _min?: TaxiManagerMinAggregateInputType
    _max?: TaxiManagerMaxAggregateInputType
  }

  export type TaxiManagerGroupByOutputType = {
    id: string
    userId: string
    firstName: string
    lastName: string
    phone: string | null
    isActive: boolean
    createdAt: Date
    _count: TaxiManagerCountAggregateOutputType | null
    _min: TaxiManagerMinAggregateOutputType | null
    _max: TaxiManagerMaxAggregateOutputType | null
  }

  type GetTaxiManagerGroupByPayload<T extends TaxiManagerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaxiManagerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaxiManagerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaxiManagerGroupByOutputType[P]>
            : GetScalarType<T[P], TaxiManagerGroupByOutputType[P]>
        }
      >
    >


  export type TaxiManagerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    isActive?: boolean
    createdAt?: boolean
    bookings?: boolean | TaxiManager$bookingsArgs<ExtArgs>
    _count?: boolean | TaxiManagerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["taxiManager"]>

  export type TaxiManagerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    isActive?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["taxiManager"]>

  export type TaxiManagerSelectScalar = {
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    isActive?: boolean
    createdAt?: boolean
  }

  export type TaxiManagerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | TaxiManager$bookingsArgs<ExtArgs>
    _count?: boolean | TaxiManagerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TaxiManagerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TaxiManagerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TaxiManager"
    objects: {
      bookings: Prisma.$BookingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      firstName: string
      lastName: string
      phone: string | null
      isActive: boolean
      createdAt: Date
    }, ExtArgs["result"]["taxiManager"]>
    composites: {}
  }

  type TaxiManagerGetPayload<S extends boolean | null | undefined | TaxiManagerDefaultArgs> = $Result.GetResult<Prisma.$TaxiManagerPayload, S>

  type TaxiManagerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TaxiManagerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TaxiManagerCountAggregateInputType | true
    }

  export interface TaxiManagerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TaxiManager'], meta: { name: 'TaxiManager' } }
    /**
     * Find zero or one TaxiManager that matches the filter.
     * @param {TaxiManagerFindUniqueArgs} args - Arguments to find a TaxiManager
     * @example
     * // Get one TaxiManager
     * const taxiManager = await prisma.taxiManager.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaxiManagerFindUniqueArgs>(args: SelectSubset<T, TaxiManagerFindUniqueArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TaxiManager that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TaxiManagerFindUniqueOrThrowArgs} args - Arguments to find a TaxiManager
     * @example
     * // Get one TaxiManager
     * const taxiManager = await prisma.taxiManager.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaxiManagerFindUniqueOrThrowArgs>(args: SelectSubset<T, TaxiManagerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TaxiManager that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerFindFirstArgs} args - Arguments to find a TaxiManager
     * @example
     * // Get one TaxiManager
     * const taxiManager = await prisma.taxiManager.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaxiManagerFindFirstArgs>(args?: SelectSubset<T, TaxiManagerFindFirstArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TaxiManager that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerFindFirstOrThrowArgs} args - Arguments to find a TaxiManager
     * @example
     * // Get one TaxiManager
     * const taxiManager = await prisma.taxiManager.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaxiManagerFindFirstOrThrowArgs>(args?: SelectSubset<T, TaxiManagerFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TaxiManagers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TaxiManagers
     * const taxiManagers = await prisma.taxiManager.findMany()
     * 
     * // Get first 10 TaxiManagers
     * const taxiManagers = await prisma.taxiManager.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taxiManagerWithIdOnly = await prisma.taxiManager.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TaxiManagerFindManyArgs>(args?: SelectSubset<T, TaxiManagerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TaxiManager.
     * @param {TaxiManagerCreateArgs} args - Arguments to create a TaxiManager.
     * @example
     * // Create one TaxiManager
     * const TaxiManager = await prisma.taxiManager.create({
     *   data: {
     *     // ... data to create a TaxiManager
     *   }
     * })
     * 
     */
    create<T extends TaxiManagerCreateArgs>(args: SelectSubset<T, TaxiManagerCreateArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TaxiManagers.
     * @param {TaxiManagerCreateManyArgs} args - Arguments to create many TaxiManagers.
     * @example
     * // Create many TaxiManagers
     * const taxiManager = await prisma.taxiManager.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaxiManagerCreateManyArgs>(args?: SelectSubset<T, TaxiManagerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TaxiManagers and returns the data saved in the database.
     * @param {TaxiManagerCreateManyAndReturnArgs} args - Arguments to create many TaxiManagers.
     * @example
     * // Create many TaxiManagers
     * const taxiManager = await prisma.taxiManager.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TaxiManagers and only return the `id`
     * const taxiManagerWithIdOnly = await prisma.taxiManager.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaxiManagerCreateManyAndReturnArgs>(args?: SelectSubset<T, TaxiManagerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TaxiManager.
     * @param {TaxiManagerDeleteArgs} args - Arguments to delete one TaxiManager.
     * @example
     * // Delete one TaxiManager
     * const TaxiManager = await prisma.taxiManager.delete({
     *   where: {
     *     // ... filter to delete one TaxiManager
     *   }
     * })
     * 
     */
    delete<T extends TaxiManagerDeleteArgs>(args: SelectSubset<T, TaxiManagerDeleteArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TaxiManager.
     * @param {TaxiManagerUpdateArgs} args - Arguments to update one TaxiManager.
     * @example
     * // Update one TaxiManager
     * const taxiManager = await prisma.taxiManager.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaxiManagerUpdateArgs>(args: SelectSubset<T, TaxiManagerUpdateArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TaxiManagers.
     * @param {TaxiManagerDeleteManyArgs} args - Arguments to filter TaxiManagers to delete.
     * @example
     * // Delete a few TaxiManagers
     * const { count } = await prisma.taxiManager.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaxiManagerDeleteManyArgs>(args?: SelectSubset<T, TaxiManagerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TaxiManagers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TaxiManagers
     * const taxiManager = await prisma.taxiManager.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaxiManagerUpdateManyArgs>(args: SelectSubset<T, TaxiManagerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TaxiManager.
     * @param {TaxiManagerUpsertArgs} args - Arguments to update or create a TaxiManager.
     * @example
     * // Update or create a TaxiManager
     * const taxiManager = await prisma.taxiManager.upsert({
     *   create: {
     *     // ... data to create a TaxiManager
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TaxiManager we want to update
     *   }
     * })
     */
    upsert<T extends TaxiManagerUpsertArgs>(args: SelectSubset<T, TaxiManagerUpsertArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TaxiManagers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerCountArgs} args - Arguments to filter TaxiManagers to count.
     * @example
     * // Count the number of TaxiManagers
     * const count = await prisma.taxiManager.count({
     *   where: {
     *     // ... the filter for the TaxiManagers we want to count
     *   }
     * })
    **/
    count<T extends TaxiManagerCountArgs>(
      args?: Subset<T, TaxiManagerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaxiManagerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TaxiManager.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaxiManagerAggregateArgs>(args: Subset<T, TaxiManagerAggregateArgs>): Prisma.PrismaPromise<GetTaxiManagerAggregateType<T>>

    /**
     * Group by TaxiManager.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaxiManagerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaxiManagerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaxiManagerGroupByArgs['orderBy'] }
        : { orderBy?: TaxiManagerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaxiManagerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaxiManagerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TaxiManager model
   */
  readonly fields: TaxiManagerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TaxiManager.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaxiManagerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends TaxiManager$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, TaxiManager$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TaxiManager model
   */ 
  interface TaxiManagerFieldRefs {
    readonly id: FieldRef<"TaxiManager", 'String'>
    readonly userId: FieldRef<"TaxiManager", 'String'>
    readonly firstName: FieldRef<"TaxiManager", 'String'>
    readonly lastName: FieldRef<"TaxiManager", 'String'>
    readonly phone: FieldRef<"TaxiManager", 'String'>
    readonly isActive: FieldRef<"TaxiManager", 'Boolean'>
    readonly createdAt: FieldRef<"TaxiManager", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TaxiManager findUnique
   */
  export type TaxiManagerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter, which TaxiManager to fetch.
     */
    where: TaxiManagerWhereUniqueInput
  }

  /**
   * TaxiManager findUniqueOrThrow
   */
  export type TaxiManagerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter, which TaxiManager to fetch.
     */
    where: TaxiManagerWhereUniqueInput
  }

  /**
   * TaxiManager findFirst
   */
  export type TaxiManagerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter, which TaxiManager to fetch.
     */
    where?: TaxiManagerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxiManagers to fetch.
     */
    orderBy?: TaxiManagerOrderByWithRelationInput | TaxiManagerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaxiManagers.
     */
    cursor?: TaxiManagerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxiManagers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxiManagers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaxiManagers.
     */
    distinct?: TaxiManagerScalarFieldEnum | TaxiManagerScalarFieldEnum[]
  }

  /**
   * TaxiManager findFirstOrThrow
   */
  export type TaxiManagerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter, which TaxiManager to fetch.
     */
    where?: TaxiManagerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxiManagers to fetch.
     */
    orderBy?: TaxiManagerOrderByWithRelationInput | TaxiManagerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaxiManagers.
     */
    cursor?: TaxiManagerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxiManagers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxiManagers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaxiManagers.
     */
    distinct?: TaxiManagerScalarFieldEnum | TaxiManagerScalarFieldEnum[]
  }

  /**
   * TaxiManager findMany
   */
  export type TaxiManagerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter, which TaxiManagers to fetch.
     */
    where?: TaxiManagerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaxiManagers to fetch.
     */
    orderBy?: TaxiManagerOrderByWithRelationInput | TaxiManagerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TaxiManagers.
     */
    cursor?: TaxiManagerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaxiManagers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaxiManagers.
     */
    skip?: number
    distinct?: TaxiManagerScalarFieldEnum | TaxiManagerScalarFieldEnum[]
  }

  /**
   * TaxiManager create
   */
  export type TaxiManagerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * The data needed to create a TaxiManager.
     */
    data: XOR<TaxiManagerCreateInput, TaxiManagerUncheckedCreateInput>
  }

  /**
   * TaxiManager createMany
   */
  export type TaxiManagerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TaxiManagers.
     */
    data: TaxiManagerCreateManyInput | TaxiManagerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TaxiManager createManyAndReturn
   */
  export type TaxiManagerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TaxiManagers.
     */
    data: TaxiManagerCreateManyInput | TaxiManagerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TaxiManager update
   */
  export type TaxiManagerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * The data needed to update a TaxiManager.
     */
    data: XOR<TaxiManagerUpdateInput, TaxiManagerUncheckedUpdateInput>
    /**
     * Choose, which TaxiManager to update.
     */
    where: TaxiManagerWhereUniqueInput
  }

  /**
   * TaxiManager updateMany
   */
  export type TaxiManagerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TaxiManagers.
     */
    data: XOR<TaxiManagerUpdateManyMutationInput, TaxiManagerUncheckedUpdateManyInput>
    /**
     * Filter which TaxiManagers to update
     */
    where?: TaxiManagerWhereInput
  }

  /**
   * TaxiManager upsert
   */
  export type TaxiManagerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * The filter to search for the TaxiManager to update in case it exists.
     */
    where: TaxiManagerWhereUniqueInput
    /**
     * In case the TaxiManager found by the `where` argument doesn't exist, create a new TaxiManager with this data.
     */
    create: XOR<TaxiManagerCreateInput, TaxiManagerUncheckedCreateInput>
    /**
     * In case the TaxiManager was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaxiManagerUpdateInput, TaxiManagerUncheckedUpdateInput>
  }

  /**
   * TaxiManager delete
   */
  export type TaxiManagerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    /**
     * Filter which TaxiManager to delete.
     */
    where: TaxiManagerWhereUniqueInput
  }

  /**
   * TaxiManager deleteMany
   */
  export type TaxiManagerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaxiManagers to delete
     */
    where?: TaxiManagerWhereInput
  }

  /**
   * TaxiManager.bookings
   */
  export type TaxiManager$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * TaxiManager without action
   */
  export type TaxiManagerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
  }


  /**
   * Model Driver
   */

  export type AggregateDriver = {
    _count: DriverCountAggregateOutputType | null
    _avg: DriverAvgAggregateOutputType | null
    _sum: DriverSumAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  export type DriverAvgAggregateOutputType = {
    ratingAvg: number | null
    ratingCount: number | null
    totalTrips: number | null
  }

  export type DriverSumAggregateOutputType = {
    ratingAvg: number | null
    ratingCount: number | null
    totalTrips: number | null
  }

  export type DriverMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    vehicleType: $Enums.VehicleType | null
    vehicleModel: string | null
    licensePlate: string | null
    status: $Enums.DriverStatus | null
    ratingAvg: number | null
    ratingCount: number | null
    totalTrips: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    vehicleType: $Enums.VehicleType | null
    vehicleModel: string | null
    licensePlate: string | null
    status: $Enums.DriverStatus | null
    ratingAvg: number | null
    ratingCount: number | null
    totalTrips: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DriverCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    phone: number
    vehicleType: number
    vehicleModel: number
    licensePlate: number
    status: number
    ratingAvg: number
    ratingCount: number
    totalTrips: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DriverAvgAggregateInputType = {
    ratingAvg?: true
    ratingCount?: true
    totalTrips?: true
  }

  export type DriverSumAggregateInputType = {
    ratingAvg?: true
    ratingCount?: true
    totalTrips?: true
  }

  export type DriverMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    phone?: true
    vehicleType?: true
    vehicleModel?: true
    licensePlate?: true
    status?: true
    ratingAvg?: true
    ratingCount?: true
    totalTrips?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    phone?: true
    vehicleType?: true
    vehicleModel?: true
    licensePlate?: true
    status?: true
    ratingAvg?: true
    ratingCount?: true
    totalTrips?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DriverCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    phone?: true
    vehicleType?: true
    vehicleModel?: true
    licensePlate?: true
    status?: true
    ratingAvg?: true
    ratingCount?: true
    totalTrips?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DriverAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Driver to aggregate.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Drivers
    **/
    _count?: true | DriverCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DriverAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DriverSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DriverMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DriverMaxAggregateInputType
  }

  export type GetDriverAggregateType<T extends DriverAggregateArgs> = {
        [P in keyof T & keyof AggregateDriver]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriver[P]>
      : GetScalarType<T[P], AggregateDriver[P]>
  }




  export type DriverGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverWhereInput
    orderBy?: DriverOrderByWithAggregationInput | DriverOrderByWithAggregationInput[]
    by: DriverScalarFieldEnum[] | DriverScalarFieldEnum
    having?: DriverScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DriverCountAggregateInputType | true
    _avg?: DriverAvgAggregateInputType
    _sum?: DriverSumAggregateInputType
    _min?: DriverMinAggregateInputType
    _max?: DriverMaxAggregateInputType
  }

  export type DriverGroupByOutputType = {
    id: string
    firstName: string
    lastName: string
    phone: string
    vehicleType: $Enums.VehicleType
    vehicleModel: string | null
    licensePlate: string
    status: $Enums.DriverStatus
    ratingAvg: number
    ratingCount: number
    totalTrips: number
    createdAt: Date
    updatedAt: Date
    _count: DriverCountAggregateOutputType | null
    _avg: DriverAvgAggregateOutputType | null
    _sum: DriverSumAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  type GetDriverGroupByPayload<T extends DriverGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DriverGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DriverGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverGroupByOutputType[P]>
            : GetScalarType<T[P], DriverGroupByOutputType[P]>
        }
      >
    >


  export type DriverSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    vehicleType?: boolean
    vehicleModel?: boolean
    licensePlate?: boolean
    status?: boolean
    ratingAvg?: boolean
    ratingCount?: boolean
    totalTrips?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    bookings?: boolean | Driver$bookingsArgs<ExtArgs>
    reviews?: boolean | Driver$reviewsArgs<ExtArgs>
    _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    vehicleType?: boolean
    vehicleModel?: boolean
    licensePlate?: boolean
    status?: boolean
    ratingAvg?: boolean
    ratingCount?: boolean
    totalTrips?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    vehicleType?: boolean
    vehicleModel?: boolean
    licensePlate?: boolean
    status?: boolean
    ratingAvg?: boolean
    ratingCount?: boolean
    totalTrips?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DriverInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | Driver$bookingsArgs<ExtArgs>
    reviews?: boolean | Driver$reviewsArgs<ExtArgs>
    _count?: boolean | DriverCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DriverIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DriverPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Driver"
    objects: {
      bookings: Prisma.$BookingPayload<ExtArgs>[]
      reviews: Prisma.$DriverReviewPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string
      phone: string
      vehicleType: $Enums.VehicleType
      vehicleModel: string | null
      licensePlate: string
      status: $Enums.DriverStatus
      ratingAvg: number
      ratingCount: number
      totalTrips: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["driver"]>
    composites: {}
  }

  type DriverGetPayload<S extends boolean | null | undefined | DriverDefaultArgs> = $Result.GetResult<Prisma.$DriverPayload, S>

  type DriverCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DriverFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DriverCountAggregateInputType | true
    }

  export interface DriverDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Driver'], meta: { name: 'Driver' } }
    /**
     * Find zero or one Driver that matches the filter.
     * @param {DriverFindUniqueArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverFindUniqueArgs>(args: SelectSubset<T, DriverFindUniqueArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Driver that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DriverFindUniqueOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverFindUniqueOrThrowArgs>(args: SelectSubset<T, DriverFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Driver that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverFindFirstArgs>(args?: SelectSubset<T, DriverFindFirstArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Driver that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverFindFirstOrThrowArgs>(args?: SelectSubset<T, DriverFindFirstOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Drivers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drivers
     * const drivers = await prisma.driver.findMany()
     * 
     * // Get first 10 Drivers
     * const drivers = await prisma.driver.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const driverWithIdOnly = await prisma.driver.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DriverFindManyArgs>(args?: SelectSubset<T, DriverFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Driver.
     * @param {DriverCreateArgs} args - Arguments to create a Driver.
     * @example
     * // Create one Driver
     * const Driver = await prisma.driver.create({
     *   data: {
     *     // ... data to create a Driver
     *   }
     * })
     * 
     */
    create<T extends DriverCreateArgs>(args: SelectSubset<T, DriverCreateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Drivers.
     * @param {DriverCreateManyArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DriverCreateManyArgs>(args?: SelectSubset<T, DriverCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Drivers and returns the data saved in the database.
     * @param {DriverCreateManyAndReturnArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DriverCreateManyAndReturnArgs>(args?: SelectSubset<T, DriverCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Driver.
     * @param {DriverDeleteArgs} args - Arguments to delete one Driver.
     * @example
     * // Delete one Driver
     * const Driver = await prisma.driver.delete({
     *   where: {
     *     // ... filter to delete one Driver
     *   }
     * })
     * 
     */
    delete<T extends DriverDeleteArgs>(args: SelectSubset<T, DriverDeleteArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Driver.
     * @param {DriverUpdateArgs} args - Arguments to update one Driver.
     * @example
     * // Update one Driver
     * const driver = await prisma.driver.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DriverUpdateArgs>(args: SelectSubset<T, DriverUpdateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Drivers.
     * @param {DriverDeleteManyArgs} args - Arguments to filter Drivers to delete.
     * @example
     * // Delete a few Drivers
     * const { count } = await prisma.driver.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DriverDeleteManyArgs>(args?: SelectSubset<T, DriverDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DriverUpdateManyArgs>(args: SelectSubset<T, DriverUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Driver.
     * @param {DriverUpsertArgs} args - Arguments to update or create a Driver.
     * @example
     * // Update or create a Driver
     * const driver = await prisma.driver.upsert({
     *   create: {
     *     // ... data to create a Driver
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Driver we want to update
     *   }
     * })
     */
    upsert<T extends DriverUpsertArgs>(args: SelectSubset<T, DriverUpsertArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverCountArgs} args - Arguments to filter Drivers to count.
     * @example
     * // Count the number of Drivers
     * const count = await prisma.driver.count({
     *   where: {
     *     // ... the filter for the Drivers we want to count
     *   }
     * })
    **/
    count<T extends DriverCountArgs>(
      args?: Subset<T, DriverCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DriverAggregateArgs>(args: Subset<T, DriverAggregateArgs>): Prisma.PrismaPromise<GetDriverAggregateType<T>>

    /**
     * Group by Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DriverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverGroupByArgs['orderBy'] }
        : { orderBy?: DriverGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DriverGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDriverGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Driver model
   */
  readonly fields: DriverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Driver.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends Driver$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Driver$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany"> | Null>
    reviews<T extends Driver$reviewsArgs<ExtArgs> = {}>(args?: Subset<T, Driver$reviewsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Driver model
   */ 
  interface DriverFieldRefs {
    readonly id: FieldRef<"Driver", 'String'>
    readonly firstName: FieldRef<"Driver", 'String'>
    readonly lastName: FieldRef<"Driver", 'String'>
    readonly phone: FieldRef<"Driver", 'String'>
    readonly vehicleType: FieldRef<"Driver", 'VehicleType'>
    readonly vehicleModel: FieldRef<"Driver", 'String'>
    readonly licensePlate: FieldRef<"Driver", 'String'>
    readonly status: FieldRef<"Driver", 'DriverStatus'>
    readonly ratingAvg: FieldRef<"Driver", 'Float'>
    readonly ratingCount: FieldRef<"Driver", 'Int'>
    readonly totalTrips: FieldRef<"Driver", 'Int'>
    readonly createdAt: FieldRef<"Driver", 'DateTime'>
    readonly updatedAt: FieldRef<"Driver", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Driver findUnique
   */
  export type DriverFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findUniqueOrThrow
   */
  export type DriverFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findFirst
   */
  export type DriverFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findFirstOrThrow
   */
  export type DriverFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findMany
   */
  export type DriverFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter, which Drivers to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver create
   */
  export type DriverCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to create a Driver.
     */
    data: XOR<DriverCreateInput, DriverUncheckedCreateInput>
  }

  /**
   * Driver createMany
   */
  export type DriverCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver createManyAndReturn
   */
  export type DriverCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver update
   */
  export type DriverUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The data needed to update a Driver.
     */
    data: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
    /**
     * Choose, which Driver to update.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver updateMany
   */
  export type DriverUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput
  }

  /**
   * Driver upsert
   */
  export type DriverUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * The filter to search for the Driver to update in case it exists.
     */
    where: DriverWhereUniqueInput
    /**
     * In case the Driver found by the `where` argument doesn't exist, create a new Driver with this data.
     */
    create: XOR<DriverCreateInput, DriverUncheckedCreateInput>
    /**
     * In case the Driver was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
  }

  /**
   * Driver delete
   */
  export type DriverDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    /**
     * Filter which Driver to delete.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver deleteMany
   */
  export type DriverDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Drivers to delete
     */
    where?: DriverWhereInput
  }

  /**
   * Driver.bookings
   */
  export type Driver$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Driver.reviews
   */
  export type Driver$reviewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    where?: DriverReviewWhereInput
    orderBy?: DriverReviewOrderByWithRelationInput | DriverReviewOrderByWithRelationInput[]
    cursor?: DriverReviewWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DriverReviewScalarFieldEnum | DriverReviewScalarFieldEnum[]
  }

  /**
   * Driver without action
   */
  export type DriverDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
  }


  /**
   * Model Booking
   */

  export type AggregateBooking = {
    _count: BookingCountAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  export type BookingMinAggregateOutputType = {
    id: string | null
    userId: string | null
    managerId: string | null
    driverId: string | null
    fromAddress: string | null
    toAddress: string | null
    scheduledAt: Date | null
    disabilityType: $Enums.DisabilityType | null
    note: string | null
    status: $Enums.BookingStatus | null
    cancelReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    managerId: string | null
    driverId: string | null
    fromAddress: string | null
    toAddress: string | null
    scheduledAt: Date | null
    disabilityType: $Enums.DisabilityType | null
    note: string | null
    status: $Enums.BookingStatus | null
    cancelReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingCountAggregateOutputType = {
    id: number
    userId: number
    managerId: number
    driverId: number
    fromAddress: number
    toAddress: number
    scheduledAt: number
    disabilityType: number
    note: number
    status: number
    cancelReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BookingMinAggregateInputType = {
    id?: true
    userId?: true
    managerId?: true
    driverId?: true
    fromAddress?: true
    toAddress?: true
    scheduledAt?: true
    disabilityType?: true
    note?: true
    status?: true
    cancelReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingMaxAggregateInputType = {
    id?: true
    userId?: true
    managerId?: true
    driverId?: true
    fromAddress?: true
    toAddress?: true
    scheduledAt?: true
    disabilityType?: true
    note?: true
    status?: true
    cancelReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingCountAggregateInputType = {
    id?: true
    userId?: true
    managerId?: true
    driverId?: true
    fromAddress?: true
    toAddress?: true
    scheduledAt?: true
    disabilityType?: true
    note?: true
    status?: true
    cancelReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Booking to aggregate.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bookings
    **/
    _count?: true | BookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookingMaxAggregateInputType
  }

  export type GetBookingAggregateType<T extends BookingAggregateArgs> = {
        [P in keyof T & keyof AggregateBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBooking[P]>
      : GetScalarType<T[P], AggregateBooking[P]>
  }




  export type BookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithAggregationInput | BookingOrderByWithAggregationInput[]
    by: BookingScalarFieldEnum[] | BookingScalarFieldEnum
    having?: BookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookingCountAggregateInputType | true
    _min?: BookingMinAggregateInputType
    _max?: BookingMaxAggregateInputType
  }

  export type BookingGroupByOutputType = {
    id: string
    userId: string
    managerId: string | null
    driverId: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date
    disabilityType: $Enums.DisabilityType
    note: string | null
    status: $Enums.BookingStatus
    cancelReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: BookingCountAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  type GetBookingGroupByPayload<T extends BookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookingGroupByOutputType[P]>
            : GetScalarType<T[P], BookingGroupByOutputType[P]>
        }
      >
    >


  export type BookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    managerId?: boolean
    driverId?: boolean
    fromAddress?: boolean
    toAddress?: boolean
    scheduledAt?: boolean
    disabilityType?: boolean
    note?: boolean
    status?: boolean
    cancelReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    manager?: boolean | Booking$managerArgs<ExtArgs>
    driver?: boolean | Booking$driverArgs<ExtArgs>
    review?: boolean | Booking$reviewArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    managerId?: boolean
    driverId?: boolean
    fromAddress?: boolean
    toAddress?: boolean
    scheduledAt?: boolean
    disabilityType?: boolean
    note?: boolean
    status?: boolean
    cancelReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    manager?: boolean | Booking$managerArgs<ExtArgs>
    driver?: boolean | Booking$driverArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectScalar = {
    id?: boolean
    userId?: boolean
    managerId?: boolean
    driverId?: boolean
    fromAddress?: boolean
    toAddress?: boolean
    scheduledAt?: boolean
    disabilityType?: boolean
    note?: boolean
    status?: boolean
    cancelReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | Booking$managerArgs<ExtArgs>
    driver?: boolean | Booking$driverArgs<ExtArgs>
    review?: boolean | Booking$reviewArgs<ExtArgs>
  }
  export type BookingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | Booking$managerArgs<ExtArgs>
    driver?: boolean | Booking$driverArgs<ExtArgs>
  }

  export type $BookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Booking"
    objects: {
      manager: Prisma.$TaxiManagerPayload<ExtArgs> | null
      driver: Prisma.$DriverPayload<ExtArgs> | null
      review: Prisma.$DriverReviewPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      managerId: string | null
      driverId: string | null
      fromAddress: string
      toAddress: string
      scheduledAt: Date
      disabilityType: $Enums.DisabilityType
      note: string | null
      status: $Enums.BookingStatus
      cancelReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["booking"]>
    composites: {}
  }

  type BookingGetPayload<S extends boolean | null | undefined | BookingDefaultArgs> = $Result.GetResult<Prisma.$BookingPayload, S>

  type BookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BookingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BookingCountAggregateInputType | true
    }

  export interface BookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Booking'], meta: { name: 'Booking' } }
    /**
     * Find zero or one Booking that matches the filter.
     * @param {BookingFindUniqueArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BookingFindUniqueArgs>(args: SelectSubset<T, BookingFindUniqueArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Booking that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BookingFindUniqueOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BookingFindUniqueOrThrowArgs>(args: SelectSubset<T, BookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Booking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BookingFindFirstArgs>(args?: SelectSubset<T, BookingFindFirstArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Booking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BookingFindFirstOrThrowArgs>(args?: SelectSubset<T, BookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bookings
     * const bookings = await prisma.booking.findMany()
     * 
     * // Get first 10 Bookings
     * const bookings = await prisma.booking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookingWithIdOnly = await prisma.booking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BookingFindManyArgs>(args?: SelectSubset<T, BookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Booking.
     * @param {BookingCreateArgs} args - Arguments to create a Booking.
     * @example
     * // Create one Booking
     * const Booking = await prisma.booking.create({
     *   data: {
     *     // ... data to create a Booking
     *   }
     * })
     * 
     */
    create<T extends BookingCreateArgs>(args: SelectSubset<T, BookingCreateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Bookings.
     * @param {BookingCreateManyArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BookingCreateManyArgs>(args?: SelectSubset<T, BookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bookings and returns the data saved in the database.
     * @param {BookingCreateManyAndReturnArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bookings and only return the `id`
     * const bookingWithIdOnly = await prisma.booking.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BookingCreateManyAndReturnArgs>(args?: SelectSubset<T, BookingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Booking.
     * @param {BookingDeleteArgs} args - Arguments to delete one Booking.
     * @example
     * // Delete one Booking
     * const Booking = await prisma.booking.delete({
     *   where: {
     *     // ... filter to delete one Booking
     *   }
     * })
     * 
     */
    delete<T extends BookingDeleteArgs>(args: SelectSubset<T, BookingDeleteArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Booking.
     * @param {BookingUpdateArgs} args - Arguments to update one Booking.
     * @example
     * // Update one Booking
     * const booking = await prisma.booking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BookingUpdateArgs>(args: SelectSubset<T, BookingUpdateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Bookings.
     * @param {BookingDeleteManyArgs} args - Arguments to filter Bookings to delete.
     * @example
     * // Delete a few Bookings
     * const { count } = await prisma.booking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BookingDeleteManyArgs>(args?: SelectSubset<T, BookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BookingUpdateManyArgs>(args: SelectSubset<T, BookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Booking.
     * @param {BookingUpsertArgs} args - Arguments to update or create a Booking.
     * @example
     * // Update or create a Booking
     * const booking = await prisma.booking.upsert({
     *   create: {
     *     // ... data to create a Booking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Booking we want to update
     *   }
     * })
     */
    upsert<T extends BookingUpsertArgs>(args: SelectSubset<T, BookingUpsertArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingCountArgs} args - Arguments to filter Bookings to count.
     * @example
     * // Count the number of Bookings
     * const count = await prisma.booking.count({
     *   where: {
     *     // ... the filter for the Bookings we want to count
     *   }
     * })
    **/
    count<T extends BookingCountArgs>(
      args?: Subset<T, BookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookingAggregateArgs>(args: Subset<T, BookingAggregateArgs>): Prisma.PrismaPromise<GetBookingAggregateType<T>>

    /**
     * Group by Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BookingGroupByArgs['orderBy'] }
        : { orderBy?: BookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Booking model
   */
  readonly fields: BookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Booking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    manager<T extends Booking$managerArgs<ExtArgs> = {}>(args?: Subset<T, Booking$managerArgs<ExtArgs>>): Prisma__TaxiManagerClient<$Result.GetResult<Prisma.$TaxiManagerPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    driver<T extends Booking$driverArgs<ExtArgs> = {}>(args?: Subset<T, Booking$driverArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    review<T extends Booking$reviewArgs<ExtArgs> = {}>(args?: Subset<T, Booking$reviewArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Booking model
   */ 
  interface BookingFieldRefs {
    readonly id: FieldRef<"Booking", 'String'>
    readonly userId: FieldRef<"Booking", 'String'>
    readonly managerId: FieldRef<"Booking", 'String'>
    readonly driverId: FieldRef<"Booking", 'String'>
    readonly fromAddress: FieldRef<"Booking", 'String'>
    readonly toAddress: FieldRef<"Booking", 'String'>
    readonly scheduledAt: FieldRef<"Booking", 'DateTime'>
    readonly disabilityType: FieldRef<"Booking", 'DisabilityType'>
    readonly note: FieldRef<"Booking", 'String'>
    readonly status: FieldRef<"Booking", 'BookingStatus'>
    readonly cancelReason: FieldRef<"Booking", 'String'>
    readonly createdAt: FieldRef<"Booking", 'DateTime'>
    readonly updatedAt: FieldRef<"Booking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Booking findUnique
   */
  export type BookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findUniqueOrThrow
   */
  export type BookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findFirst
   */
  export type BookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findFirstOrThrow
   */
  export type BookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findMany
   */
  export type BookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Bookings to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking create
   */
  export type BookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to create a Booking.
     */
    data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
  }

  /**
   * Booking createMany
   */
  export type BookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Booking createManyAndReturn
   */
  export type BookingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Booking update
   */
  export type BookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to update a Booking.
     */
    data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
    /**
     * Choose, which Booking to update.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking updateMany
   */
  export type BookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
  }

  /**
   * Booking upsert
   */
  export type BookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The filter to search for the Booking to update in case it exists.
     */
    where: BookingWhereUniqueInput
    /**
     * In case the Booking found by the `where` argument doesn't exist, create a new Booking with this data.
     */
    create: XOR<BookingCreateInput, BookingUncheckedCreateInput>
    /**
     * In case the Booking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
  }

  /**
   * Booking delete
   */
  export type BookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter which Booking to delete.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking deleteMany
   */
  export type BookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bookings to delete
     */
    where?: BookingWhereInput
  }

  /**
   * Booking.manager
   */
  export type Booking$managerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaxiManager
     */
    select?: TaxiManagerSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaxiManagerInclude<ExtArgs> | null
    where?: TaxiManagerWhereInput
  }

  /**
   * Booking.driver
   */
  export type Booking$driverArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverInclude<ExtArgs> | null
    where?: DriverWhereInput
  }

  /**
   * Booking.review
   */
  export type Booking$reviewArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    where?: DriverReviewWhereInput
  }

  /**
   * Booking without action
   */
  export type BookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
  }


  /**
   * Model DriverReview
   */

  export type AggregateDriverReview = {
    _count: DriverReviewCountAggregateOutputType | null
    _avg: DriverReviewAvgAggregateOutputType | null
    _sum: DriverReviewSumAggregateOutputType | null
    _min: DriverReviewMinAggregateOutputType | null
    _max: DriverReviewMaxAggregateOutputType | null
  }

  export type DriverReviewAvgAggregateOutputType = {
    rating: number | null
  }

  export type DriverReviewSumAggregateOutputType = {
    rating: number | null
  }

  export type DriverReviewMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    driverId: string | null
    userId: string | null
    rating: number | null
    comment: string | null
    createdAt: Date | null
  }

  export type DriverReviewMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    driverId: string | null
    userId: string | null
    rating: number | null
    comment: string | null
    createdAt: Date | null
  }

  export type DriverReviewCountAggregateOutputType = {
    id: number
    bookingId: number
    driverId: number
    userId: number
    rating: number
    comment: number
    createdAt: number
    _all: number
  }


  export type DriverReviewAvgAggregateInputType = {
    rating?: true
  }

  export type DriverReviewSumAggregateInputType = {
    rating?: true
  }

  export type DriverReviewMinAggregateInputType = {
    id?: true
    bookingId?: true
    driverId?: true
    userId?: true
    rating?: true
    comment?: true
    createdAt?: true
  }

  export type DriverReviewMaxAggregateInputType = {
    id?: true
    bookingId?: true
    driverId?: true
    userId?: true
    rating?: true
    comment?: true
    createdAt?: true
  }

  export type DriverReviewCountAggregateInputType = {
    id?: true
    bookingId?: true
    driverId?: true
    userId?: true
    rating?: true
    comment?: true
    createdAt?: true
    _all?: true
  }

  export type DriverReviewAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DriverReview to aggregate.
     */
    where?: DriverReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DriverReviews to fetch.
     */
    orderBy?: DriverReviewOrderByWithRelationInput | DriverReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DriverReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DriverReviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DriverReviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DriverReviews
    **/
    _count?: true | DriverReviewCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DriverReviewAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DriverReviewSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DriverReviewMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DriverReviewMaxAggregateInputType
  }

  export type GetDriverReviewAggregateType<T extends DriverReviewAggregateArgs> = {
        [P in keyof T & keyof AggregateDriverReview]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriverReview[P]>
      : GetScalarType<T[P], AggregateDriverReview[P]>
  }




  export type DriverReviewGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverReviewWhereInput
    orderBy?: DriverReviewOrderByWithAggregationInput | DriverReviewOrderByWithAggregationInput[]
    by: DriverReviewScalarFieldEnum[] | DriverReviewScalarFieldEnum
    having?: DriverReviewScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DriverReviewCountAggregateInputType | true
    _avg?: DriverReviewAvgAggregateInputType
    _sum?: DriverReviewSumAggregateInputType
    _min?: DriverReviewMinAggregateInputType
    _max?: DriverReviewMaxAggregateInputType
  }

  export type DriverReviewGroupByOutputType = {
    id: string
    bookingId: string
    driverId: string
    userId: string
    rating: number
    comment: string | null
    createdAt: Date
    _count: DriverReviewCountAggregateOutputType | null
    _avg: DriverReviewAvgAggregateOutputType | null
    _sum: DriverReviewSumAggregateOutputType | null
    _min: DriverReviewMinAggregateOutputType | null
    _max: DriverReviewMaxAggregateOutputType | null
  }

  type GetDriverReviewGroupByPayload<T extends DriverReviewGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DriverReviewGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DriverReviewGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverReviewGroupByOutputType[P]>
            : GetScalarType<T[P], DriverReviewGroupByOutputType[P]>
        }
      >
    >


  export type DriverReviewSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    driverId?: boolean
    userId?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
    driver?: boolean | DriverDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driverReview"]>

  export type DriverReviewSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    driverId?: boolean
    userId?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
    driver?: boolean | DriverDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["driverReview"]>

  export type DriverReviewSelectScalar = {
    id?: boolean
    bookingId?: boolean
    driverId?: boolean
    userId?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
  }

  export type DriverReviewInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
    driver?: boolean | DriverDefaultArgs<ExtArgs>
  }
  export type DriverReviewIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
    driver?: boolean | DriverDefaultArgs<ExtArgs>
  }

  export type $DriverReviewPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DriverReview"
    objects: {
      booking: Prisma.$BookingPayload<ExtArgs>
      driver: Prisma.$DriverPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      driverId: string
      userId: string
      rating: number
      comment: string | null
      createdAt: Date
    }, ExtArgs["result"]["driverReview"]>
    composites: {}
  }

  type DriverReviewGetPayload<S extends boolean | null | undefined | DriverReviewDefaultArgs> = $Result.GetResult<Prisma.$DriverReviewPayload, S>

  type DriverReviewCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DriverReviewFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DriverReviewCountAggregateInputType | true
    }

  export interface DriverReviewDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DriverReview'], meta: { name: 'DriverReview' } }
    /**
     * Find zero or one DriverReview that matches the filter.
     * @param {DriverReviewFindUniqueArgs} args - Arguments to find a DriverReview
     * @example
     * // Get one DriverReview
     * const driverReview = await prisma.driverReview.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverReviewFindUniqueArgs>(args: SelectSubset<T, DriverReviewFindUniqueArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DriverReview that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DriverReviewFindUniqueOrThrowArgs} args - Arguments to find a DriverReview
     * @example
     * // Get one DriverReview
     * const driverReview = await prisma.driverReview.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverReviewFindUniqueOrThrowArgs>(args: SelectSubset<T, DriverReviewFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DriverReview that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewFindFirstArgs} args - Arguments to find a DriverReview
     * @example
     * // Get one DriverReview
     * const driverReview = await prisma.driverReview.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverReviewFindFirstArgs>(args?: SelectSubset<T, DriverReviewFindFirstArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DriverReview that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewFindFirstOrThrowArgs} args - Arguments to find a DriverReview
     * @example
     * // Get one DriverReview
     * const driverReview = await prisma.driverReview.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverReviewFindFirstOrThrowArgs>(args?: SelectSubset<T, DriverReviewFindFirstOrThrowArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DriverReviews that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DriverReviews
     * const driverReviews = await prisma.driverReview.findMany()
     * 
     * // Get first 10 DriverReviews
     * const driverReviews = await prisma.driverReview.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const driverReviewWithIdOnly = await prisma.driverReview.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DriverReviewFindManyArgs>(args?: SelectSubset<T, DriverReviewFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DriverReview.
     * @param {DriverReviewCreateArgs} args - Arguments to create a DriverReview.
     * @example
     * // Create one DriverReview
     * const DriverReview = await prisma.driverReview.create({
     *   data: {
     *     // ... data to create a DriverReview
     *   }
     * })
     * 
     */
    create<T extends DriverReviewCreateArgs>(args: SelectSubset<T, DriverReviewCreateArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DriverReviews.
     * @param {DriverReviewCreateManyArgs} args - Arguments to create many DriverReviews.
     * @example
     * // Create many DriverReviews
     * const driverReview = await prisma.driverReview.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DriverReviewCreateManyArgs>(args?: SelectSubset<T, DriverReviewCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DriverReviews and returns the data saved in the database.
     * @param {DriverReviewCreateManyAndReturnArgs} args - Arguments to create many DriverReviews.
     * @example
     * // Create many DriverReviews
     * const driverReview = await prisma.driverReview.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DriverReviews and only return the `id`
     * const driverReviewWithIdOnly = await prisma.driverReview.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DriverReviewCreateManyAndReturnArgs>(args?: SelectSubset<T, DriverReviewCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DriverReview.
     * @param {DriverReviewDeleteArgs} args - Arguments to delete one DriverReview.
     * @example
     * // Delete one DriverReview
     * const DriverReview = await prisma.driverReview.delete({
     *   where: {
     *     // ... filter to delete one DriverReview
     *   }
     * })
     * 
     */
    delete<T extends DriverReviewDeleteArgs>(args: SelectSubset<T, DriverReviewDeleteArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DriverReview.
     * @param {DriverReviewUpdateArgs} args - Arguments to update one DriverReview.
     * @example
     * // Update one DriverReview
     * const driverReview = await prisma.driverReview.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DriverReviewUpdateArgs>(args: SelectSubset<T, DriverReviewUpdateArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DriverReviews.
     * @param {DriverReviewDeleteManyArgs} args - Arguments to filter DriverReviews to delete.
     * @example
     * // Delete a few DriverReviews
     * const { count } = await prisma.driverReview.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DriverReviewDeleteManyArgs>(args?: SelectSubset<T, DriverReviewDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DriverReviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DriverReviews
     * const driverReview = await prisma.driverReview.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DriverReviewUpdateManyArgs>(args: SelectSubset<T, DriverReviewUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DriverReview.
     * @param {DriverReviewUpsertArgs} args - Arguments to update or create a DriverReview.
     * @example
     * // Update or create a DriverReview
     * const driverReview = await prisma.driverReview.upsert({
     *   create: {
     *     // ... data to create a DriverReview
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DriverReview we want to update
     *   }
     * })
     */
    upsert<T extends DriverReviewUpsertArgs>(args: SelectSubset<T, DriverReviewUpsertArgs<ExtArgs>>): Prisma__DriverReviewClient<$Result.GetResult<Prisma.$DriverReviewPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DriverReviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewCountArgs} args - Arguments to filter DriverReviews to count.
     * @example
     * // Count the number of DriverReviews
     * const count = await prisma.driverReview.count({
     *   where: {
     *     // ... the filter for the DriverReviews we want to count
     *   }
     * })
    **/
    count<T extends DriverReviewCountArgs>(
      args?: Subset<T, DriverReviewCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverReviewCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DriverReview.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DriverReviewAggregateArgs>(args: Subset<T, DriverReviewAggregateArgs>): Prisma.PrismaPromise<GetDriverReviewAggregateType<T>>

    /**
     * Group by DriverReview.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverReviewGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DriverReviewGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverReviewGroupByArgs['orderBy'] }
        : { orderBy?: DriverReviewGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DriverReviewGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDriverReviewGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DriverReview model
   */
  readonly fields: DriverReviewFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DriverReview.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverReviewClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends BookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BookingDefaultArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    driver<T extends DriverDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DriverDefaultArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DriverReview model
   */ 
  interface DriverReviewFieldRefs {
    readonly id: FieldRef<"DriverReview", 'String'>
    readonly bookingId: FieldRef<"DriverReview", 'String'>
    readonly driverId: FieldRef<"DriverReview", 'String'>
    readonly userId: FieldRef<"DriverReview", 'String'>
    readonly rating: FieldRef<"DriverReview", 'Int'>
    readonly comment: FieldRef<"DriverReview", 'String'>
    readonly createdAt: FieldRef<"DriverReview", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DriverReview findUnique
   */
  export type DriverReviewFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter, which DriverReview to fetch.
     */
    where: DriverReviewWhereUniqueInput
  }

  /**
   * DriverReview findUniqueOrThrow
   */
  export type DriverReviewFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter, which DriverReview to fetch.
     */
    where: DriverReviewWhereUniqueInput
  }

  /**
   * DriverReview findFirst
   */
  export type DriverReviewFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter, which DriverReview to fetch.
     */
    where?: DriverReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DriverReviews to fetch.
     */
    orderBy?: DriverReviewOrderByWithRelationInput | DriverReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DriverReviews.
     */
    cursor?: DriverReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DriverReviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DriverReviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DriverReviews.
     */
    distinct?: DriverReviewScalarFieldEnum | DriverReviewScalarFieldEnum[]
  }

  /**
   * DriverReview findFirstOrThrow
   */
  export type DriverReviewFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter, which DriverReview to fetch.
     */
    where?: DriverReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DriverReviews to fetch.
     */
    orderBy?: DriverReviewOrderByWithRelationInput | DriverReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DriverReviews.
     */
    cursor?: DriverReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DriverReviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DriverReviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DriverReviews.
     */
    distinct?: DriverReviewScalarFieldEnum | DriverReviewScalarFieldEnum[]
  }

  /**
   * DriverReview findMany
   */
  export type DriverReviewFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter, which DriverReviews to fetch.
     */
    where?: DriverReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DriverReviews to fetch.
     */
    orderBy?: DriverReviewOrderByWithRelationInput | DriverReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DriverReviews.
     */
    cursor?: DriverReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DriverReviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DriverReviews.
     */
    skip?: number
    distinct?: DriverReviewScalarFieldEnum | DriverReviewScalarFieldEnum[]
  }

  /**
   * DriverReview create
   */
  export type DriverReviewCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * The data needed to create a DriverReview.
     */
    data: XOR<DriverReviewCreateInput, DriverReviewUncheckedCreateInput>
  }

  /**
   * DriverReview createMany
   */
  export type DriverReviewCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DriverReviews.
     */
    data: DriverReviewCreateManyInput | DriverReviewCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DriverReview createManyAndReturn
   */
  export type DriverReviewCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DriverReviews.
     */
    data: DriverReviewCreateManyInput | DriverReviewCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DriverReview update
   */
  export type DriverReviewUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * The data needed to update a DriverReview.
     */
    data: XOR<DriverReviewUpdateInput, DriverReviewUncheckedUpdateInput>
    /**
     * Choose, which DriverReview to update.
     */
    where: DriverReviewWhereUniqueInput
  }

  /**
   * DriverReview updateMany
   */
  export type DriverReviewUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DriverReviews.
     */
    data: XOR<DriverReviewUpdateManyMutationInput, DriverReviewUncheckedUpdateManyInput>
    /**
     * Filter which DriverReviews to update
     */
    where?: DriverReviewWhereInput
  }

  /**
   * DriverReview upsert
   */
  export type DriverReviewUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * The filter to search for the DriverReview to update in case it exists.
     */
    where: DriverReviewWhereUniqueInput
    /**
     * In case the DriverReview found by the `where` argument doesn't exist, create a new DriverReview with this data.
     */
    create: XOR<DriverReviewCreateInput, DriverReviewUncheckedCreateInput>
    /**
     * In case the DriverReview was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverReviewUpdateInput, DriverReviewUncheckedUpdateInput>
  }

  /**
   * DriverReview delete
   */
  export type DriverReviewDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
    /**
     * Filter which DriverReview to delete.
     */
    where: DriverReviewWhereUniqueInput
  }

  /**
   * DriverReview deleteMany
   */
  export type DriverReviewDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DriverReviews to delete
     */
    where?: DriverReviewWhereInput
  }

  /**
   * DriverReview without action
   */
  export type DriverReviewDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DriverReview
     */
    select?: DriverReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DriverReviewInclude<ExtArgs> | null
  }


  /**
   * Model ManagerInvite
   */

  export type AggregateManagerInvite = {
    _count: ManagerInviteCountAggregateOutputType | null
    _min: ManagerInviteMinAggregateOutputType | null
    _max: ManagerInviteMaxAggregateOutputType | null
  }

  export type ManagerInviteMinAggregateOutputType = {
    id: string | null
    code: string | null
    usedBy: string | null
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type ManagerInviteMaxAggregateOutputType = {
    id: string | null
    code: string | null
    usedBy: string | null
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type ManagerInviteCountAggregateOutputType = {
    id: number
    code: number
    usedBy: number
    usedAt: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type ManagerInviteMinAggregateInputType = {
    id?: true
    code?: true
    usedBy?: true
    usedAt?: true
    expiresAt?: true
    createdAt?: true
  }

  export type ManagerInviteMaxAggregateInputType = {
    id?: true
    code?: true
    usedBy?: true
    usedAt?: true
    expiresAt?: true
    createdAt?: true
  }

  export type ManagerInviteCountAggregateInputType = {
    id?: true
    code?: true
    usedBy?: true
    usedAt?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type ManagerInviteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ManagerInvite to aggregate.
     */
    where?: ManagerInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManagerInvites to fetch.
     */
    orderBy?: ManagerInviteOrderByWithRelationInput | ManagerInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ManagerInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManagerInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManagerInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ManagerInvites
    **/
    _count?: true | ManagerInviteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ManagerInviteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ManagerInviteMaxAggregateInputType
  }

  export type GetManagerInviteAggregateType<T extends ManagerInviteAggregateArgs> = {
        [P in keyof T & keyof AggregateManagerInvite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateManagerInvite[P]>
      : GetScalarType<T[P], AggregateManagerInvite[P]>
  }




  export type ManagerInviteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ManagerInviteWhereInput
    orderBy?: ManagerInviteOrderByWithAggregationInput | ManagerInviteOrderByWithAggregationInput[]
    by: ManagerInviteScalarFieldEnum[] | ManagerInviteScalarFieldEnum
    having?: ManagerInviteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ManagerInviteCountAggregateInputType | true
    _min?: ManagerInviteMinAggregateInputType
    _max?: ManagerInviteMaxAggregateInputType
  }

  export type ManagerInviteGroupByOutputType = {
    id: string
    code: string
    usedBy: string | null
    usedAt: Date | null
    expiresAt: Date
    createdAt: Date
    _count: ManagerInviteCountAggregateOutputType | null
    _min: ManagerInviteMinAggregateOutputType | null
    _max: ManagerInviteMaxAggregateOutputType | null
  }

  type GetManagerInviteGroupByPayload<T extends ManagerInviteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ManagerInviteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ManagerInviteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ManagerInviteGroupByOutputType[P]>
            : GetScalarType<T[P], ManagerInviteGroupByOutputType[P]>
        }
      >
    >


  export type ManagerInviteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    usedBy?: boolean
    usedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["managerInvite"]>

  export type ManagerInviteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    usedBy?: boolean
    usedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["managerInvite"]>

  export type ManagerInviteSelectScalar = {
    id?: boolean
    code?: boolean
    usedBy?: boolean
    usedAt?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }


  export type $ManagerInvitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ManagerInvite"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      usedBy: string | null
      usedAt: Date | null
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["managerInvite"]>
    composites: {}
  }

  type ManagerInviteGetPayload<S extends boolean | null | undefined | ManagerInviteDefaultArgs> = $Result.GetResult<Prisma.$ManagerInvitePayload, S>

  type ManagerInviteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ManagerInviteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ManagerInviteCountAggregateInputType | true
    }

  export interface ManagerInviteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ManagerInvite'], meta: { name: 'ManagerInvite' } }
    /**
     * Find zero or one ManagerInvite that matches the filter.
     * @param {ManagerInviteFindUniqueArgs} args - Arguments to find a ManagerInvite
     * @example
     * // Get one ManagerInvite
     * const managerInvite = await prisma.managerInvite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ManagerInviteFindUniqueArgs>(args: SelectSubset<T, ManagerInviteFindUniqueArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ManagerInvite that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ManagerInviteFindUniqueOrThrowArgs} args - Arguments to find a ManagerInvite
     * @example
     * // Get one ManagerInvite
     * const managerInvite = await prisma.managerInvite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ManagerInviteFindUniqueOrThrowArgs>(args: SelectSubset<T, ManagerInviteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ManagerInvite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteFindFirstArgs} args - Arguments to find a ManagerInvite
     * @example
     * // Get one ManagerInvite
     * const managerInvite = await prisma.managerInvite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ManagerInviteFindFirstArgs>(args?: SelectSubset<T, ManagerInviteFindFirstArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ManagerInvite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteFindFirstOrThrowArgs} args - Arguments to find a ManagerInvite
     * @example
     * // Get one ManagerInvite
     * const managerInvite = await prisma.managerInvite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ManagerInviteFindFirstOrThrowArgs>(args?: SelectSubset<T, ManagerInviteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ManagerInvites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ManagerInvites
     * const managerInvites = await prisma.managerInvite.findMany()
     * 
     * // Get first 10 ManagerInvites
     * const managerInvites = await prisma.managerInvite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const managerInviteWithIdOnly = await prisma.managerInvite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ManagerInviteFindManyArgs>(args?: SelectSubset<T, ManagerInviteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ManagerInvite.
     * @param {ManagerInviteCreateArgs} args - Arguments to create a ManagerInvite.
     * @example
     * // Create one ManagerInvite
     * const ManagerInvite = await prisma.managerInvite.create({
     *   data: {
     *     // ... data to create a ManagerInvite
     *   }
     * })
     * 
     */
    create<T extends ManagerInviteCreateArgs>(args: SelectSubset<T, ManagerInviteCreateArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ManagerInvites.
     * @param {ManagerInviteCreateManyArgs} args - Arguments to create many ManagerInvites.
     * @example
     * // Create many ManagerInvites
     * const managerInvite = await prisma.managerInvite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ManagerInviteCreateManyArgs>(args?: SelectSubset<T, ManagerInviteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ManagerInvites and returns the data saved in the database.
     * @param {ManagerInviteCreateManyAndReturnArgs} args - Arguments to create many ManagerInvites.
     * @example
     * // Create many ManagerInvites
     * const managerInvite = await prisma.managerInvite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ManagerInvites and only return the `id`
     * const managerInviteWithIdOnly = await prisma.managerInvite.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ManagerInviteCreateManyAndReturnArgs>(args?: SelectSubset<T, ManagerInviteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ManagerInvite.
     * @param {ManagerInviteDeleteArgs} args - Arguments to delete one ManagerInvite.
     * @example
     * // Delete one ManagerInvite
     * const ManagerInvite = await prisma.managerInvite.delete({
     *   where: {
     *     // ... filter to delete one ManagerInvite
     *   }
     * })
     * 
     */
    delete<T extends ManagerInviteDeleteArgs>(args: SelectSubset<T, ManagerInviteDeleteArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ManagerInvite.
     * @param {ManagerInviteUpdateArgs} args - Arguments to update one ManagerInvite.
     * @example
     * // Update one ManagerInvite
     * const managerInvite = await prisma.managerInvite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ManagerInviteUpdateArgs>(args: SelectSubset<T, ManagerInviteUpdateArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ManagerInvites.
     * @param {ManagerInviteDeleteManyArgs} args - Arguments to filter ManagerInvites to delete.
     * @example
     * // Delete a few ManagerInvites
     * const { count } = await prisma.managerInvite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ManagerInviteDeleteManyArgs>(args?: SelectSubset<T, ManagerInviteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ManagerInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ManagerInvites
     * const managerInvite = await prisma.managerInvite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ManagerInviteUpdateManyArgs>(args: SelectSubset<T, ManagerInviteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ManagerInvite.
     * @param {ManagerInviteUpsertArgs} args - Arguments to update or create a ManagerInvite.
     * @example
     * // Update or create a ManagerInvite
     * const managerInvite = await prisma.managerInvite.upsert({
     *   create: {
     *     // ... data to create a ManagerInvite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ManagerInvite we want to update
     *   }
     * })
     */
    upsert<T extends ManagerInviteUpsertArgs>(args: SelectSubset<T, ManagerInviteUpsertArgs<ExtArgs>>): Prisma__ManagerInviteClient<$Result.GetResult<Prisma.$ManagerInvitePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ManagerInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteCountArgs} args - Arguments to filter ManagerInvites to count.
     * @example
     * // Count the number of ManagerInvites
     * const count = await prisma.managerInvite.count({
     *   where: {
     *     // ... the filter for the ManagerInvites we want to count
     *   }
     * })
    **/
    count<T extends ManagerInviteCountArgs>(
      args?: Subset<T, ManagerInviteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ManagerInviteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ManagerInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ManagerInviteAggregateArgs>(args: Subset<T, ManagerInviteAggregateArgs>): Prisma.PrismaPromise<GetManagerInviteAggregateType<T>>

    /**
     * Group by ManagerInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ManagerInviteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ManagerInviteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ManagerInviteGroupByArgs['orderBy'] }
        : { orderBy?: ManagerInviteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ManagerInviteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetManagerInviteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ManagerInvite model
   */
  readonly fields: ManagerInviteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ManagerInvite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ManagerInviteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ManagerInvite model
   */ 
  interface ManagerInviteFieldRefs {
    readonly id: FieldRef<"ManagerInvite", 'String'>
    readonly code: FieldRef<"ManagerInvite", 'String'>
    readonly usedBy: FieldRef<"ManagerInvite", 'String'>
    readonly usedAt: FieldRef<"ManagerInvite", 'DateTime'>
    readonly expiresAt: FieldRef<"ManagerInvite", 'DateTime'>
    readonly createdAt: FieldRef<"ManagerInvite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ManagerInvite findUnique
   */
  export type ManagerInviteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter, which ManagerInvite to fetch.
     */
    where: ManagerInviteWhereUniqueInput
  }

  /**
   * ManagerInvite findUniqueOrThrow
   */
  export type ManagerInviteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter, which ManagerInvite to fetch.
     */
    where: ManagerInviteWhereUniqueInput
  }

  /**
   * ManagerInvite findFirst
   */
  export type ManagerInviteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter, which ManagerInvite to fetch.
     */
    where?: ManagerInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManagerInvites to fetch.
     */
    orderBy?: ManagerInviteOrderByWithRelationInput | ManagerInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ManagerInvites.
     */
    cursor?: ManagerInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManagerInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManagerInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ManagerInvites.
     */
    distinct?: ManagerInviteScalarFieldEnum | ManagerInviteScalarFieldEnum[]
  }

  /**
   * ManagerInvite findFirstOrThrow
   */
  export type ManagerInviteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter, which ManagerInvite to fetch.
     */
    where?: ManagerInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManagerInvites to fetch.
     */
    orderBy?: ManagerInviteOrderByWithRelationInput | ManagerInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ManagerInvites.
     */
    cursor?: ManagerInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManagerInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManagerInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ManagerInvites.
     */
    distinct?: ManagerInviteScalarFieldEnum | ManagerInviteScalarFieldEnum[]
  }

  /**
   * ManagerInvite findMany
   */
  export type ManagerInviteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter, which ManagerInvites to fetch.
     */
    where?: ManagerInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ManagerInvites to fetch.
     */
    orderBy?: ManagerInviteOrderByWithRelationInput | ManagerInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ManagerInvites.
     */
    cursor?: ManagerInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ManagerInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ManagerInvites.
     */
    skip?: number
    distinct?: ManagerInviteScalarFieldEnum | ManagerInviteScalarFieldEnum[]
  }

  /**
   * ManagerInvite create
   */
  export type ManagerInviteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * The data needed to create a ManagerInvite.
     */
    data: XOR<ManagerInviteCreateInput, ManagerInviteUncheckedCreateInput>
  }

  /**
   * ManagerInvite createMany
   */
  export type ManagerInviteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ManagerInvites.
     */
    data: ManagerInviteCreateManyInput | ManagerInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ManagerInvite createManyAndReturn
   */
  export type ManagerInviteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ManagerInvites.
     */
    data: ManagerInviteCreateManyInput | ManagerInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ManagerInvite update
   */
  export type ManagerInviteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * The data needed to update a ManagerInvite.
     */
    data: XOR<ManagerInviteUpdateInput, ManagerInviteUncheckedUpdateInput>
    /**
     * Choose, which ManagerInvite to update.
     */
    where: ManagerInviteWhereUniqueInput
  }

  /**
   * ManagerInvite updateMany
   */
  export type ManagerInviteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ManagerInvites.
     */
    data: XOR<ManagerInviteUpdateManyMutationInput, ManagerInviteUncheckedUpdateManyInput>
    /**
     * Filter which ManagerInvites to update
     */
    where?: ManagerInviteWhereInput
  }

  /**
   * ManagerInvite upsert
   */
  export type ManagerInviteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * The filter to search for the ManagerInvite to update in case it exists.
     */
    where: ManagerInviteWhereUniqueInput
    /**
     * In case the ManagerInvite found by the `where` argument doesn't exist, create a new ManagerInvite with this data.
     */
    create: XOR<ManagerInviteCreateInput, ManagerInviteUncheckedCreateInput>
    /**
     * In case the ManagerInvite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ManagerInviteUpdateInput, ManagerInviteUncheckedUpdateInput>
  }

  /**
   * ManagerInvite delete
   */
  export type ManagerInviteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
    /**
     * Filter which ManagerInvite to delete.
     */
    where: ManagerInviteWhereUniqueInput
  }

  /**
   * ManagerInvite deleteMany
   */
  export type ManagerInviteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ManagerInvites to delete
     */
    where?: ManagerInviteWhereInput
  }

  /**
   * ManagerInvite without action
   */
  export type ManagerInviteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ManagerInvite
     */
    select?: ManagerInviteSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TaxiManagerScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    isActive: 'isActive',
    createdAt: 'createdAt'
  };

  export type TaxiManagerScalarFieldEnum = (typeof TaxiManagerScalarFieldEnum)[keyof typeof TaxiManagerScalarFieldEnum]


  export const DriverScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    vehicleType: 'vehicleType',
    vehicleModel: 'vehicleModel',
    licensePlate: 'licensePlate',
    status: 'status',
    ratingAvg: 'ratingAvg',
    ratingCount: 'ratingCount',
    totalTrips: 'totalTrips',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DriverScalarFieldEnum = (typeof DriverScalarFieldEnum)[keyof typeof DriverScalarFieldEnum]


  export const BookingScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    managerId: 'managerId',
    driverId: 'driverId',
    fromAddress: 'fromAddress',
    toAddress: 'toAddress',
    scheduledAt: 'scheduledAt',
    disabilityType: 'disabilityType',
    note: 'note',
    status: 'status',
    cancelReason: 'cancelReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BookingScalarFieldEnum = (typeof BookingScalarFieldEnum)[keyof typeof BookingScalarFieldEnum]


  export const DriverReviewScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    driverId: 'driverId',
    userId: 'userId',
    rating: 'rating',
    comment: 'comment',
    createdAt: 'createdAt'
  };

  export type DriverReviewScalarFieldEnum = (typeof DriverReviewScalarFieldEnum)[keyof typeof DriverReviewScalarFieldEnum]


  export const ManagerInviteScalarFieldEnum: {
    id: 'id',
    code: 'code',
    usedBy: 'usedBy',
    usedAt: 'usedAt',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type ManagerInviteScalarFieldEnum = (typeof ManagerInviteScalarFieldEnum)[keyof typeof ManagerInviteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'VehicleType'
   */
  export type EnumVehicleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VehicleType'>
    


  /**
   * Reference to a field of type 'VehicleType[]'
   */
  export type ListEnumVehicleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VehicleType[]'>
    


  /**
   * Reference to a field of type 'DriverStatus'
   */
  export type EnumDriverStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DriverStatus'>
    


  /**
   * Reference to a field of type 'DriverStatus[]'
   */
  export type ListEnumDriverStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DriverStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DisabilityType'
   */
  export type EnumDisabilityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DisabilityType'>
    


  /**
   * Reference to a field of type 'DisabilityType[]'
   */
  export type ListEnumDisabilityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DisabilityType[]'>
    


  /**
   * Reference to a field of type 'BookingStatus'
   */
  export type EnumBookingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BookingStatus'>
    


  /**
   * Reference to a field of type 'BookingStatus[]'
   */
  export type ListEnumBookingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BookingStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type TaxiManagerWhereInput = {
    AND?: TaxiManagerWhereInput | TaxiManagerWhereInput[]
    OR?: TaxiManagerWhereInput[]
    NOT?: TaxiManagerWhereInput | TaxiManagerWhereInput[]
    id?: StringFilter<"TaxiManager"> | string
    userId?: StringFilter<"TaxiManager"> | string
    firstName?: StringFilter<"TaxiManager"> | string
    lastName?: StringFilter<"TaxiManager"> | string
    phone?: StringNullableFilter<"TaxiManager"> | string | null
    isActive?: BoolFilter<"TaxiManager"> | boolean
    createdAt?: DateTimeFilter<"TaxiManager"> | Date | string
    bookings?: BookingListRelationFilter
  }

  export type TaxiManagerOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    bookings?: BookingOrderByRelationAggregateInput
  }

  export type TaxiManagerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: TaxiManagerWhereInput | TaxiManagerWhereInput[]
    OR?: TaxiManagerWhereInput[]
    NOT?: TaxiManagerWhereInput | TaxiManagerWhereInput[]
    firstName?: StringFilter<"TaxiManager"> | string
    lastName?: StringFilter<"TaxiManager"> | string
    phone?: StringNullableFilter<"TaxiManager"> | string | null
    isActive?: BoolFilter<"TaxiManager"> | boolean
    createdAt?: DateTimeFilter<"TaxiManager"> | Date | string
    bookings?: BookingListRelationFilter
  }, "id" | "userId">

  export type TaxiManagerOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    _count?: TaxiManagerCountOrderByAggregateInput
    _max?: TaxiManagerMaxOrderByAggregateInput
    _min?: TaxiManagerMinOrderByAggregateInput
  }

  export type TaxiManagerScalarWhereWithAggregatesInput = {
    AND?: TaxiManagerScalarWhereWithAggregatesInput | TaxiManagerScalarWhereWithAggregatesInput[]
    OR?: TaxiManagerScalarWhereWithAggregatesInput[]
    NOT?: TaxiManagerScalarWhereWithAggregatesInput | TaxiManagerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TaxiManager"> | string
    userId?: StringWithAggregatesFilter<"TaxiManager"> | string
    firstName?: StringWithAggregatesFilter<"TaxiManager"> | string
    lastName?: StringWithAggregatesFilter<"TaxiManager"> | string
    phone?: StringNullableWithAggregatesFilter<"TaxiManager"> | string | null
    isActive?: BoolWithAggregatesFilter<"TaxiManager"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"TaxiManager"> | Date | string
  }

  export type DriverWhereInput = {
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    id?: StringFilter<"Driver"> | string
    firstName?: StringFilter<"Driver"> | string
    lastName?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    vehicleType?: EnumVehicleTypeFilter<"Driver"> | $Enums.VehicleType
    vehicleModel?: StringNullableFilter<"Driver"> | string | null
    licensePlate?: StringFilter<"Driver"> | string
    status?: EnumDriverStatusFilter<"Driver"> | $Enums.DriverStatus
    ratingAvg?: FloatFilter<"Driver"> | number
    ratingCount?: IntFilter<"Driver"> | number
    totalTrips?: IntFilter<"Driver"> | number
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    updatedAt?: DateTimeFilter<"Driver"> | Date | string
    bookings?: BookingListRelationFilter
    reviews?: DriverReviewListRelationFilter
  }

  export type DriverOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    vehicleType?: SortOrder
    vehicleModel?: SortOrderInput | SortOrder
    licensePlate?: SortOrder
    status?: SortOrder
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    bookings?: BookingOrderByRelationAggregateInput
    reviews?: DriverReviewOrderByRelationAggregateInput
  }

  export type DriverWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phone?: string
    licensePlate?: string
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    firstName?: StringFilter<"Driver"> | string
    lastName?: StringFilter<"Driver"> | string
    vehicleType?: EnumVehicleTypeFilter<"Driver"> | $Enums.VehicleType
    vehicleModel?: StringNullableFilter<"Driver"> | string | null
    status?: EnumDriverStatusFilter<"Driver"> | $Enums.DriverStatus
    ratingAvg?: FloatFilter<"Driver"> | number
    ratingCount?: IntFilter<"Driver"> | number
    totalTrips?: IntFilter<"Driver"> | number
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    updatedAt?: DateTimeFilter<"Driver"> | Date | string
    bookings?: BookingListRelationFilter
    reviews?: DriverReviewListRelationFilter
  }, "id" | "phone" | "licensePlate">

  export type DriverOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    vehicleType?: SortOrder
    vehicleModel?: SortOrderInput | SortOrder
    licensePlate?: SortOrder
    status?: SortOrder
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DriverCountOrderByAggregateInput
    _avg?: DriverAvgOrderByAggregateInput
    _max?: DriverMaxOrderByAggregateInput
    _min?: DriverMinOrderByAggregateInput
    _sum?: DriverSumOrderByAggregateInput
  }

  export type DriverScalarWhereWithAggregatesInput = {
    AND?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    OR?: DriverScalarWhereWithAggregatesInput[]
    NOT?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Driver"> | string
    firstName?: StringWithAggregatesFilter<"Driver"> | string
    lastName?: StringWithAggregatesFilter<"Driver"> | string
    phone?: StringWithAggregatesFilter<"Driver"> | string
    vehicleType?: EnumVehicleTypeWithAggregatesFilter<"Driver"> | $Enums.VehicleType
    vehicleModel?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    licensePlate?: StringWithAggregatesFilter<"Driver"> | string
    status?: EnumDriverStatusWithAggregatesFilter<"Driver"> | $Enums.DriverStatus
    ratingAvg?: FloatWithAggregatesFilter<"Driver"> | number
    ratingCount?: IntWithAggregatesFilter<"Driver"> | number
    totalTrips?: IntWithAggregatesFilter<"Driver"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Driver"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Driver"> | Date | string
  }

  export type BookingWhereInput = {
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    id?: StringFilter<"Booking"> | string
    userId?: StringFilter<"Booking"> | string
    managerId?: StringNullableFilter<"Booking"> | string | null
    driverId?: StringNullableFilter<"Booking"> | string | null
    fromAddress?: StringFilter<"Booking"> | string
    toAddress?: StringFilter<"Booking"> | string
    scheduledAt?: DateTimeFilter<"Booking"> | Date | string
    disabilityType?: EnumDisabilityTypeFilter<"Booking"> | $Enums.DisabilityType
    note?: StringNullableFilter<"Booking"> | string | null
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    cancelReason?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
    manager?: XOR<TaxiManagerNullableRelationFilter, TaxiManagerWhereInput> | null
    driver?: XOR<DriverNullableRelationFilter, DriverWhereInput> | null
    review?: XOR<DriverReviewNullableRelationFilter, DriverReviewWhereInput> | null
  }

  export type BookingOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    managerId?: SortOrderInput | SortOrder
    driverId?: SortOrderInput | SortOrder
    fromAddress?: SortOrder
    toAddress?: SortOrder
    scheduledAt?: SortOrder
    disabilityType?: SortOrder
    note?: SortOrderInput | SortOrder
    status?: SortOrder
    cancelReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    manager?: TaxiManagerOrderByWithRelationInput
    driver?: DriverOrderByWithRelationInput
    review?: DriverReviewOrderByWithRelationInput
  }

  export type BookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    userId?: StringFilter<"Booking"> | string
    managerId?: StringNullableFilter<"Booking"> | string | null
    driverId?: StringNullableFilter<"Booking"> | string | null
    fromAddress?: StringFilter<"Booking"> | string
    toAddress?: StringFilter<"Booking"> | string
    scheduledAt?: DateTimeFilter<"Booking"> | Date | string
    disabilityType?: EnumDisabilityTypeFilter<"Booking"> | $Enums.DisabilityType
    note?: StringNullableFilter<"Booking"> | string | null
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    cancelReason?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
    manager?: XOR<TaxiManagerNullableRelationFilter, TaxiManagerWhereInput> | null
    driver?: XOR<DriverNullableRelationFilter, DriverWhereInput> | null
    review?: XOR<DriverReviewNullableRelationFilter, DriverReviewWhereInput> | null
  }, "id">

  export type BookingOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    managerId?: SortOrderInput | SortOrder
    driverId?: SortOrderInput | SortOrder
    fromAddress?: SortOrder
    toAddress?: SortOrder
    scheduledAt?: SortOrder
    disabilityType?: SortOrder
    note?: SortOrderInput | SortOrder
    status?: SortOrder
    cancelReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BookingCountOrderByAggregateInput
    _max?: BookingMaxOrderByAggregateInput
    _min?: BookingMinOrderByAggregateInput
  }

  export type BookingScalarWhereWithAggregatesInput = {
    AND?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    OR?: BookingScalarWhereWithAggregatesInput[]
    NOT?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Booking"> | string
    userId?: StringWithAggregatesFilter<"Booking"> | string
    managerId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    driverId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    fromAddress?: StringWithAggregatesFilter<"Booking"> | string
    toAddress?: StringWithAggregatesFilter<"Booking"> | string
    scheduledAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    disabilityType?: EnumDisabilityTypeWithAggregatesFilter<"Booking"> | $Enums.DisabilityType
    note?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    status?: EnumBookingStatusWithAggregatesFilter<"Booking"> | $Enums.BookingStatus
    cancelReason?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
  }

  export type DriverReviewWhereInput = {
    AND?: DriverReviewWhereInput | DriverReviewWhereInput[]
    OR?: DriverReviewWhereInput[]
    NOT?: DriverReviewWhereInput | DriverReviewWhereInput[]
    id?: StringFilter<"DriverReview"> | string
    bookingId?: StringFilter<"DriverReview"> | string
    driverId?: StringFilter<"DriverReview"> | string
    userId?: StringFilter<"DriverReview"> | string
    rating?: IntFilter<"DriverReview"> | number
    comment?: StringNullableFilter<"DriverReview"> | string | null
    createdAt?: DateTimeFilter<"DriverReview"> | Date | string
    booking?: XOR<BookingRelationFilter, BookingWhereInput>
    driver?: XOR<DriverRelationFilter, DriverWhereInput>
  }

  export type DriverReviewOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    driverId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    comment?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    booking?: BookingOrderByWithRelationInput
    driver?: DriverOrderByWithRelationInput
  }

  export type DriverReviewWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    bookingId?: string
    AND?: DriverReviewWhereInput | DriverReviewWhereInput[]
    OR?: DriverReviewWhereInput[]
    NOT?: DriverReviewWhereInput | DriverReviewWhereInput[]
    driverId?: StringFilter<"DriverReview"> | string
    userId?: StringFilter<"DriverReview"> | string
    rating?: IntFilter<"DriverReview"> | number
    comment?: StringNullableFilter<"DriverReview"> | string | null
    createdAt?: DateTimeFilter<"DriverReview"> | Date | string
    booking?: XOR<BookingRelationFilter, BookingWhereInput>
    driver?: XOR<DriverRelationFilter, DriverWhereInput>
  }, "id" | "bookingId">

  export type DriverReviewOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    driverId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    comment?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DriverReviewCountOrderByAggregateInput
    _avg?: DriverReviewAvgOrderByAggregateInput
    _max?: DriverReviewMaxOrderByAggregateInput
    _min?: DriverReviewMinOrderByAggregateInput
    _sum?: DriverReviewSumOrderByAggregateInput
  }

  export type DriverReviewScalarWhereWithAggregatesInput = {
    AND?: DriverReviewScalarWhereWithAggregatesInput | DriverReviewScalarWhereWithAggregatesInput[]
    OR?: DriverReviewScalarWhereWithAggregatesInput[]
    NOT?: DriverReviewScalarWhereWithAggregatesInput | DriverReviewScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DriverReview"> | string
    bookingId?: StringWithAggregatesFilter<"DriverReview"> | string
    driverId?: StringWithAggregatesFilter<"DriverReview"> | string
    userId?: StringWithAggregatesFilter<"DriverReview"> | string
    rating?: IntWithAggregatesFilter<"DriverReview"> | number
    comment?: StringNullableWithAggregatesFilter<"DriverReview"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DriverReview"> | Date | string
  }

  export type ManagerInviteWhereInput = {
    AND?: ManagerInviteWhereInput | ManagerInviteWhereInput[]
    OR?: ManagerInviteWhereInput[]
    NOT?: ManagerInviteWhereInput | ManagerInviteWhereInput[]
    id?: StringFilter<"ManagerInvite"> | string
    code?: StringFilter<"ManagerInvite"> | string
    usedBy?: StringNullableFilter<"ManagerInvite"> | string | null
    usedAt?: DateTimeNullableFilter<"ManagerInvite"> | Date | string | null
    expiresAt?: DateTimeFilter<"ManagerInvite"> | Date | string
    createdAt?: DateTimeFilter<"ManagerInvite"> | Date | string
  }

  export type ManagerInviteOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    usedBy?: SortOrderInput | SortOrder
    usedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ManagerInviteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: ManagerInviteWhereInput | ManagerInviteWhereInput[]
    OR?: ManagerInviteWhereInput[]
    NOT?: ManagerInviteWhereInput | ManagerInviteWhereInput[]
    usedBy?: StringNullableFilter<"ManagerInvite"> | string | null
    usedAt?: DateTimeNullableFilter<"ManagerInvite"> | Date | string | null
    expiresAt?: DateTimeFilter<"ManagerInvite"> | Date | string
    createdAt?: DateTimeFilter<"ManagerInvite"> | Date | string
  }, "id" | "code">

  export type ManagerInviteOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    usedBy?: SortOrderInput | SortOrder
    usedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: ManagerInviteCountOrderByAggregateInput
    _max?: ManagerInviteMaxOrderByAggregateInput
    _min?: ManagerInviteMinOrderByAggregateInput
  }

  export type ManagerInviteScalarWhereWithAggregatesInput = {
    AND?: ManagerInviteScalarWhereWithAggregatesInput | ManagerInviteScalarWhereWithAggregatesInput[]
    OR?: ManagerInviteScalarWhereWithAggregatesInput[]
    NOT?: ManagerInviteScalarWhereWithAggregatesInput | ManagerInviteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ManagerInvite"> | string
    code?: StringWithAggregatesFilter<"ManagerInvite"> | string
    usedBy?: StringNullableWithAggregatesFilter<"ManagerInvite"> | string | null
    usedAt?: DateTimeNullableWithAggregatesFilter<"ManagerInvite"> | Date | string | null
    expiresAt?: DateTimeWithAggregatesFilter<"ManagerInvite"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"ManagerInvite"> | Date | string
  }

  export type TaxiManagerCreateInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    phone?: string | null
    isActive?: boolean
    createdAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutManagerInput
  }

  export type TaxiManagerUncheckedCreateInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    phone?: string | null
    isActive?: boolean
    createdAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutManagerInput
  }

  export type TaxiManagerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutManagerNestedInput
  }

  export type TaxiManagerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutManagerNestedInput
  }

  export type TaxiManagerCreateManyInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    phone?: string | null
    isActive?: boolean
    createdAt?: Date | string
  }

  export type TaxiManagerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxiManagerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverCreateInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutDriverInput
    reviews?: DriverReviewCreateNestedManyWithoutDriverInput
  }

  export type DriverUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutDriverInput
    reviews?: DriverReviewUncheckedCreateNestedManyWithoutDriverInput
  }

  export type DriverUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutDriverNestedInput
    reviews?: DriverReviewUpdateManyWithoutDriverNestedInput
  }

  export type DriverUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutDriverNestedInput
    reviews?: DriverReviewUncheckedUpdateManyWithoutDriverNestedInput
  }

  export type DriverCreateManyInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingCreateInput = {
    id?: string
    userId: string
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    manager?: TaxiManagerCreateNestedOneWithoutBookingsInput
    driver?: DriverCreateNestedOneWithoutBookingsInput
    review?: DriverReviewCreateNestedOneWithoutBookingInput
  }

  export type BookingUncheckedCreateInput = {
    id?: string
    userId: string
    managerId?: string | null
    driverId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    review?: DriverReviewUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    manager?: TaxiManagerUpdateOneWithoutBookingsNestedInput
    driver?: DriverUpdateOneWithoutBookingsNestedInput
    review?: DriverReviewUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    review?: DriverReviewUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingCreateManyInput = {
    id?: string
    userId: string
    managerId?: string | null
    driverId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverReviewCreateInput = {
    id?: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
    booking: BookingCreateNestedOneWithoutReviewInput
    driver: DriverCreateNestedOneWithoutReviewsInput
  }

  export type DriverReviewUncheckedCreateInput = {
    id?: string
    bookingId: string
    driverId: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
  }

  export type DriverReviewUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: BookingUpdateOneRequiredWithoutReviewNestedInput
    driver?: DriverUpdateOneRequiredWithoutReviewsNestedInput
  }

  export type DriverReviewUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverReviewCreateManyInput = {
    id?: string
    bookingId: string
    driverId: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
  }

  export type DriverReviewUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverReviewUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManagerInviteCreateInput = {
    id?: string
    code: string
    usedBy?: string | null
    usedAt?: Date | string | null
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type ManagerInviteUncheckedCreateInput = {
    id?: string
    code: string
    usedBy?: string | null
    usedAt?: Date | string | null
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type ManagerInviteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    usedBy?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManagerInviteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    usedBy?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManagerInviteCreateManyInput = {
    id?: string
    code: string
    usedBy?: string | null
    usedAt?: Date | string | null
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type ManagerInviteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    usedBy?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ManagerInviteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    usedBy?: NullableStringFieldUpdateOperationsInput | string | null
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BookingListRelationFilter = {
    every?: BookingWhereInput
    some?: BookingWhereInput
    none?: BookingWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BookingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaxiManagerCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type TaxiManagerMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type TaxiManagerMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumVehicleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeFilter<$PrismaModel> | $Enums.VehicleType
  }

  export type EnumDriverStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverStatus | EnumDriverStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDriverStatusFilter<$PrismaModel> | $Enums.DriverStatus
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DriverReviewListRelationFilter = {
    every?: DriverReviewWhereInput
    some?: DriverReviewWhereInput
    none?: DriverReviewWhereInput
  }

  export type DriverReviewOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DriverCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    vehicleType?: SortOrder
    vehicleModel?: SortOrder
    licensePlate?: SortOrder
    status?: SortOrder
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverAvgOrderByAggregateInput = {
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
  }

  export type DriverMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    vehicleType?: SortOrder
    vehicleModel?: SortOrder
    licensePlate?: SortOrder
    status?: SortOrder
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    vehicleType?: SortOrder
    vehicleModel?: SortOrder
    licensePlate?: SortOrder
    status?: SortOrder
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DriverSumOrderByAggregateInput = {
    ratingAvg?: SortOrder
    ratingCount?: SortOrder
    totalTrips?: SortOrder
  }

  export type EnumVehicleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel> | $Enums.VehicleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVehicleTypeFilter<$PrismaModel>
    _max?: NestedEnumVehicleTypeFilter<$PrismaModel>
  }

  export type EnumDriverStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverStatus | EnumDriverStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDriverStatusWithAggregatesFilter<$PrismaModel> | $Enums.DriverStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDriverStatusFilter<$PrismaModel>
    _max?: NestedEnumDriverStatusFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumDisabilityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DisabilityType | EnumDisabilityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDisabilityTypeFilter<$PrismaModel> | $Enums.DisabilityType
  }

  export type EnumBookingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusFilter<$PrismaModel> | $Enums.BookingStatus
  }

  export type TaxiManagerNullableRelationFilter = {
    is?: TaxiManagerWhereInput | null
    isNot?: TaxiManagerWhereInput | null
  }

  export type DriverNullableRelationFilter = {
    is?: DriverWhereInput | null
    isNot?: DriverWhereInput | null
  }

  export type DriverReviewNullableRelationFilter = {
    is?: DriverReviewWhereInput | null
    isNot?: DriverReviewWhereInput | null
  }

  export type BookingCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    managerId?: SortOrder
    driverId?: SortOrder
    fromAddress?: SortOrder
    toAddress?: SortOrder
    scheduledAt?: SortOrder
    disabilityType?: SortOrder
    note?: SortOrder
    status?: SortOrder
    cancelReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookingMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    managerId?: SortOrder
    driverId?: SortOrder
    fromAddress?: SortOrder
    toAddress?: SortOrder
    scheduledAt?: SortOrder
    disabilityType?: SortOrder
    note?: SortOrder
    status?: SortOrder
    cancelReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookingMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    managerId?: SortOrder
    driverId?: SortOrder
    fromAddress?: SortOrder
    toAddress?: SortOrder
    scheduledAt?: SortOrder
    disabilityType?: SortOrder
    note?: SortOrder
    status?: SortOrder
    cancelReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumDisabilityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DisabilityType | EnumDisabilityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDisabilityTypeWithAggregatesFilter<$PrismaModel> | $Enums.DisabilityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDisabilityTypeFilter<$PrismaModel>
    _max?: NestedEnumDisabilityTypeFilter<$PrismaModel>
  }

  export type EnumBookingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel> | $Enums.BookingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBookingStatusFilter<$PrismaModel>
    _max?: NestedEnumBookingStatusFilter<$PrismaModel>
  }

  export type BookingRelationFilter = {
    is?: BookingWhereInput
    isNot?: BookingWhereInput
  }

  export type DriverRelationFilter = {
    is?: DriverWhereInput
    isNot?: DriverWhereInput
  }

  export type DriverReviewCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    driverId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
  }

  export type DriverReviewAvgOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type DriverReviewMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    driverId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
  }

  export type DriverReviewMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    driverId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
  }

  export type DriverReviewSumOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ManagerInviteCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    usedBy?: SortOrder
    usedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ManagerInviteMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    usedBy?: SortOrder
    usedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ManagerInviteMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    usedBy?: SortOrder
    usedAt?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BookingCreateNestedManyWithoutManagerInput = {
    create?: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput> | BookingCreateWithoutManagerInput[] | BookingUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutManagerInput | BookingCreateOrConnectWithoutManagerInput[]
    createMany?: BookingCreateManyManagerInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutManagerInput = {
    create?: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput> | BookingCreateWithoutManagerInput[] | BookingUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutManagerInput | BookingCreateOrConnectWithoutManagerInput[]
    createMany?: BookingCreateManyManagerInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BookingUpdateManyWithoutManagerNestedInput = {
    create?: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput> | BookingCreateWithoutManagerInput[] | BookingUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutManagerInput | BookingCreateOrConnectWithoutManagerInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutManagerInput | BookingUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: BookingCreateManyManagerInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutManagerInput | BookingUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutManagerInput | BookingUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutManagerNestedInput = {
    create?: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput> | BookingCreateWithoutManagerInput[] | BookingUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutManagerInput | BookingCreateOrConnectWithoutManagerInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutManagerInput | BookingUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: BookingCreateManyManagerInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutManagerInput | BookingUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutManagerInput | BookingUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type BookingCreateNestedManyWithoutDriverInput = {
    create?: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput> | BookingCreateWithoutDriverInput[] | BookingUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutDriverInput | BookingCreateOrConnectWithoutDriverInput[]
    createMany?: BookingCreateManyDriverInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type DriverReviewCreateNestedManyWithoutDriverInput = {
    create?: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput> | DriverReviewCreateWithoutDriverInput[] | DriverReviewUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: DriverReviewCreateOrConnectWithoutDriverInput | DriverReviewCreateOrConnectWithoutDriverInput[]
    createMany?: DriverReviewCreateManyDriverInputEnvelope
    connect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutDriverInput = {
    create?: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput> | BookingCreateWithoutDriverInput[] | BookingUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutDriverInput | BookingCreateOrConnectWithoutDriverInput[]
    createMany?: BookingCreateManyDriverInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type DriverReviewUncheckedCreateNestedManyWithoutDriverInput = {
    create?: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput> | DriverReviewCreateWithoutDriverInput[] | DriverReviewUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: DriverReviewCreateOrConnectWithoutDriverInput | DriverReviewCreateOrConnectWithoutDriverInput[]
    createMany?: DriverReviewCreateManyDriverInputEnvelope
    connect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
  }

  export type EnumVehicleTypeFieldUpdateOperationsInput = {
    set?: $Enums.VehicleType
  }

  export type EnumDriverStatusFieldUpdateOperationsInput = {
    set?: $Enums.DriverStatus
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BookingUpdateManyWithoutDriverNestedInput = {
    create?: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput> | BookingCreateWithoutDriverInput[] | BookingUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutDriverInput | BookingCreateOrConnectWithoutDriverInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutDriverInput | BookingUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: BookingCreateManyDriverInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutDriverInput | BookingUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutDriverInput | BookingUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type DriverReviewUpdateManyWithoutDriverNestedInput = {
    create?: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput> | DriverReviewCreateWithoutDriverInput[] | DriverReviewUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: DriverReviewCreateOrConnectWithoutDriverInput | DriverReviewCreateOrConnectWithoutDriverInput[]
    upsert?: DriverReviewUpsertWithWhereUniqueWithoutDriverInput | DriverReviewUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: DriverReviewCreateManyDriverInputEnvelope
    set?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    disconnect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    delete?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    connect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    update?: DriverReviewUpdateWithWhereUniqueWithoutDriverInput | DriverReviewUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: DriverReviewUpdateManyWithWhereWithoutDriverInput | DriverReviewUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: DriverReviewScalarWhereInput | DriverReviewScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutDriverNestedInput = {
    create?: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput> | BookingCreateWithoutDriverInput[] | BookingUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutDriverInput | BookingCreateOrConnectWithoutDriverInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutDriverInput | BookingUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: BookingCreateManyDriverInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutDriverInput | BookingUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutDriverInput | BookingUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type DriverReviewUncheckedUpdateManyWithoutDriverNestedInput = {
    create?: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput> | DriverReviewCreateWithoutDriverInput[] | DriverReviewUncheckedCreateWithoutDriverInput[]
    connectOrCreate?: DriverReviewCreateOrConnectWithoutDriverInput | DriverReviewCreateOrConnectWithoutDriverInput[]
    upsert?: DriverReviewUpsertWithWhereUniqueWithoutDriverInput | DriverReviewUpsertWithWhereUniqueWithoutDriverInput[]
    createMany?: DriverReviewCreateManyDriverInputEnvelope
    set?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    disconnect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    delete?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    connect?: DriverReviewWhereUniqueInput | DriverReviewWhereUniqueInput[]
    update?: DriverReviewUpdateWithWhereUniqueWithoutDriverInput | DriverReviewUpdateWithWhereUniqueWithoutDriverInput[]
    updateMany?: DriverReviewUpdateManyWithWhereWithoutDriverInput | DriverReviewUpdateManyWithWhereWithoutDriverInput[]
    deleteMany?: DriverReviewScalarWhereInput | DriverReviewScalarWhereInput[]
  }

  export type TaxiManagerCreateNestedOneWithoutBookingsInput = {
    create?: XOR<TaxiManagerCreateWithoutBookingsInput, TaxiManagerUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TaxiManagerCreateOrConnectWithoutBookingsInput
    connect?: TaxiManagerWhereUniqueInput
  }

  export type DriverCreateNestedOneWithoutBookingsInput = {
    create?: XOR<DriverCreateWithoutBookingsInput, DriverUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutBookingsInput
    connect?: DriverWhereUniqueInput
  }

  export type DriverReviewCreateNestedOneWithoutBookingInput = {
    create?: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: DriverReviewCreateOrConnectWithoutBookingInput
    connect?: DriverReviewWhereUniqueInput
  }

  export type DriverReviewUncheckedCreateNestedOneWithoutBookingInput = {
    create?: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: DriverReviewCreateOrConnectWithoutBookingInput
    connect?: DriverReviewWhereUniqueInput
  }

  export type EnumDisabilityTypeFieldUpdateOperationsInput = {
    set?: $Enums.DisabilityType
  }

  export type EnumBookingStatusFieldUpdateOperationsInput = {
    set?: $Enums.BookingStatus
  }

  export type TaxiManagerUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<TaxiManagerCreateWithoutBookingsInput, TaxiManagerUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: TaxiManagerCreateOrConnectWithoutBookingsInput
    upsert?: TaxiManagerUpsertWithoutBookingsInput
    disconnect?: TaxiManagerWhereInput | boolean
    delete?: TaxiManagerWhereInput | boolean
    connect?: TaxiManagerWhereUniqueInput
    update?: XOR<XOR<TaxiManagerUpdateToOneWithWhereWithoutBookingsInput, TaxiManagerUpdateWithoutBookingsInput>, TaxiManagerUncheckedUpdateWithoutBookingsInput>
  }

  export type DriverUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<DriverCreateWithoutBookingsInput, DriverUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutBookingsInput
    upsert?: DriverUpsertWithoutBookingsInput
    disconnect?: DriverWhereInput | boolean
    delete?: DriverWhereInput | boolean
    connect?: DriverWhereUniqueInput
    update?: XOR<XOR<DriverUpdateToOneWithWhereWithoutBookingsInput, DriverUpdateWithoutBookingsInput>, DriverUncheckedUpdateWithoutBookingsInput>
  }

  export type DriverReviewUpdateOneWithoutBookingNestedInput = {
    create?: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: DriverReviewCreateOrConnectWithoutBookingInput
    upsert?: DriverReviewUpsertWithoutBookingInput
    disconnect?: DriverReviewWhereInput | boolean
    delete?: DriverReviewWhereInput | boolean
    connect?: DriverReviewWhereUniqueInput
    update?: XOR<XOR<DriverReviewUpdateToOneWithWhereWithoutBookingInput, DriverReviewUpdateWithoutBookingInput>, DriverReviewUncheckedUpdateWithoutBookingInput>
  }

  export type DriverReviewUncheckedUpdateOneWithoutBookingNestedInput = {
    create?: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: DriverReviewCreateOrConnectWithoutBookingInput
    upsert?: DriverReviewUpsertWithoutBookingInput
    disconnect?: DriverReviewWhereInput | boolean
    delete?: DriverReviewWhereInput | boolean
    connect?: DriverReviewWhereUniqueInput
    update?: XOR<XOR<DriverReviewUpdateToOneWithWhereWithoutBookingInput, DriverReviewUpdateWithoutBookingInput>, DriverReviewUncheckedUpdateWithoutBookingInput>
  }

  export type BookingCreateNestedOneWithoutReviewInput = {
    create?: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    connectOrCreate?: BookingCreateOrConnectWithoutReviewInput
    connect?: BookingWhereUniqueInput
  }

  export type DriverCreateNestedOneWithoutReviewsInput = {
    create?: XOR<DriverCreateWithoutReviewsInput, DriverUncheckedCreateWithoutReviewsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutReviewsInput
    connect?: DriverWhereUniqueInput
  }

  export type BookingUpdateOneRequiredWithoutReviewNestedInput = {
    create?: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    connectOrCreate?: BookingCreateOrConnectWithoutReviewInput
    upsert?: BookingUpsertWithoutReviewInput
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutReviewInput, BookingUpdateWithoutReviewInput>, BookingUncheckedUpdateWithoutReviewInput>
  }

  export type DriverUpdateOneRequiredWithoutReviewsNestedInput = {
    create?: XOR<DriverCreateWithoutReviewsInput, DriverUncheckedCreateWithoutReviewsInput>
    connectOrCreate?: DriverCreateOrConnectWithoutReviewsInput
    upsert?: DriverUpsertWithoutReviewsInput
    connect?: DriverWhereUniqueInput
    update?: XOR<XOR<DriverUpdateToOneWithWhereWithoutReviewsInput, DriverUpdateWithoutReviewsInput>, DriverUncheckedUpdateWithoutReviewsInput>
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumVehicleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeFilter<$PrismaModel> | $Enums.VehicleType
  }

  export type NestedEnumDriverStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverStatus | EnumDriverStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDriverStatusFilter<$PrismaModel> | $Enums.DriverStatus
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VehicleType | EnumVehicleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VehicleType[] | ListEnumVehicleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVehicleTypeWithAggregatesFilter<$PrismaModel> | $Enums.VehicleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVehicleTypeFilter<$PrismaModel>
    _max?: NestedEnumVehicleTypeFilter<$PrismaModel>
  }

  export type NestedEnumDriverStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DriverStatus | EnumDriverStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DriverStatus[] | ListEnumDriverStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDriverStatusWithAggregatesFilter<$PrismaModel> | $Enums.DriverStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDriverStatusFilter<$PrismaModel>
    _max?: NestedEnumDriverStatusFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedEnumDisabilityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DisabilityType | EnumDisabilityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDisabilityTypeFilter<$PrismaModel> | $Enums.DisabilityType
  }

  export type NestedEnumBookingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusFilter<$PrismaModel> | $Enums.BookingStatus
  }

  export type NestedEnumDisabilityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DisabilityType | EnumDisabilityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DisabilityType[] | ListEnumDisabilityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDisabilityTypeWithAggregatesFilter<$PrismaModel> | $Enums.DisabilityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDisabilityTypeFilter<$PrismaModel>
    _max?: NestedEnumDisabilityTypeFilter<$PrismaModel>
  }

  export type NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BookingStatus | EnumBookingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BookingStatus[] | ListEnumBookingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBookingStatusWithAggregatesFilter<$PrismaModel> | $Enums.BookingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBookingStatusFilter<$PrismaModel>
    _max?: NestedEnumBookingStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BookingCreateWithoutManagerInput = {
    id?: string
    userId: string
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    driver?: DriverCreateNestedOneWithoutBookingsInput
    review?: DriverReviewCreateNestedOneWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutManagerInput = {
    id?: string
    userId: string
    driverId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    review?: DriverReviewUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutManagerInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput>
  }

  export type BookingCreateManyManagerInputEnvelope = {
    data: BookingCreateManyManagerInput | BookingCreateManyManagerInput[]
    skipDuplicates?: boolean
  }

  export type BookingUpsertWithWhereUniqueWithoutManagerInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutManagerInput, BookingUncheckedUpdateWithoutManagerInput>
    create: XOR<BookingCreateWithoutManagerInput, BookingUncheckedCreateWithoutManagerInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutManagerInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutManagerInput, BookingUncheckedUpdateWithoutManagerInput>
  }

  export type BookingUpdateManyWithWhereWithoutManagerInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutManagerInput>
  }

  export type BookingScalarWhereInput = {
    AND?: BookingScalarWhereInput | BookingScalarWhereInput[]
    OR?: BookingScalarWhereInput[]
    NOT?: BookingScalarWhereInput | BookingScalarWhereInput[]
    id?: StringFilter<"Booking"> | string
    userId?: StringFilter<"Booking"> | string
    managerId?: StringNullableFilter<"Booking"> | string | null
    driverId?: StringNullableFilter<"Booking"> | string | null
    fromAddress?: StringFilter<"Booking"> | string
    toAddress?: StringFilter<"Booking"> | string
    scheduledAt?: DateTimeFilter<"Booking"> | Date | string
    disabilityType?: EnumDisabilityTypeFilter<"Booking"> | $Enums.DisabilityType
    note?: StringNullableFilter<"Booking"> | string | null
    status?: EnumBookingStatusFilter<"Booking"> | $Enums.BookingStatus
    cancelReason?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
  }

  export type BookingCreateWithoutDriverInput = {
    id?: string
    userId: string
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    manager?: TaxiManagerCreateNestedOneWithoutBookingsInput
    review?: DriverReviewCreateNestedOneWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutDriverInput = {
    id?: string
    userId: string
    managerId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    review?: DriverReviewUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutDriverInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput>
  }

  export type BookingCreateManyDriverInputEnvelope = {
    data: BookingCreateManyDriverInput | BookingCreateManyDriverInput[]
    skipDuplicates?: boolean
  }

  export type DriverReviewCreateWithoutDriverInput = {
    id?: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
    booking: BookingCreateNestedOneWithoutReviewInput
  }

  export type DriverReviewUncheckedCreateWithoutDriverInput = {
    id?: string
    bookingId: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
  }

  export type DriverReviewCreateOrConnectWithoutDriverInput = {
    where: DriverReviewWhereUniqueInput
    create: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput>
  }

  export type DriverReviewCreateManyDriverInputEnvelope = {
    data: DriverReviewCreateManyDriverInput | DriverReviewCreateManyDriverInput[]
    skipDuplicates?: boolean
  }

  export type BookingUpsertWithWhereUniqueWithoutDriverInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutDriverInput, BookingUncheckedUpdateWithoutDriverInput>
    create: XOR<BookingCreateWithoutDriverInput, BookingUncheckedCreateWithoutDriverInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutDriverInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutDriverInput, BookingUncheckedUpdateWithoutDriverInput>
  }

  export type BookingUpdateManyWithWhereWithoutDriverInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutDriverInput>
  }

  export type DriverReviewUpsertWithWhereUniqueWithoutDriverInput = {
    where: DriverReviewWhereUniqueInput
    update: XOR<DriverReviewUpdateWithoutDriverInput, DriverReviewUncheckedUpdateWithoutDriverInput>
    create: XOR<DriverReviewCreateWithoutDriverInput, DriverReviewUncheckedCreateWithoutDriverInput>
  }

  export type DriverReviewUpdateWithWhereUniqueWithoutDriverInput = {
    where: DriverReviewWhereUniqueInput
    data: XOR<DriverReviewUpdateWithoutDriverInput, DriverReviewUncheckedUpdateWithoutDriverInput>
  }

  export type DriverReviewUpdateManyWithWhereWithoutDriverInput = {
    where: DriverReviewScalarWhereInput
    data: XOR<DriverReviewUpdateManyMutationInput, DriverReviewUncheckedUpdateManyWithoutDriverInput>
  }

  export type DriverReviewScalarWhereInput = {
    AND?: DriverReviewScalarWhereInput | DriverReviewScalarWhereInput[]
    OR?: DriverReviewScalarWhereInput[]
    NOT?: DriverReviewScalarWhereInput | DriverReviewScalarWhereInput[]
    id?: StringFilter<"DriverReview"> | string
    bookingId?: StringFilter<"DriverReview"> | string
    driverId?: StringFilter<"DriverReview"> | string
    userId?: StringFilter<"DriverReview"> | string
    rating?: IntFilter<"DriverReview"> | number
    comment?: StringNullableFilter<"DriverReview"> | string | null
    createdAt?: DateTimeFilter<"DriverReview"> | Date | string
  }

  export type TaxiManagerCreateWithoutBookingsInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    phone?: string | null
    isActive?: boolean
    createdAt?: Date | string
  }

  export type TaxiManagerUncheckedCreateWithoutBookingsInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    phone?: string | null
    isActive?: boolean
    createdAt?: Date | string
  }

  export type TaxiManagerCreateOrConnectWithoutBookingsInput = {
    where: TaxiManagerWhereUniqueInput
    create: XOR<TaxiManagerCreateWithoutBookingsInput, TaxiManagerUncheckedCreateWithoutBookingsInput>
  }

  export type DriverCreateWithoutBookingsInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    reviews?: DriverReviewCreateNestedManyWithoutDriverInput
  }

  export type DriverUncheckedCreateWithoutBookingsInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    reviews?: DriverReviewUncheckedCreateNestedManyWithoutDriverInput
  }

  export type DriverCreateOrConnectWithoutBookingsInput = {
    where: DriverWhereUniqueInput
    create: XOR<DriverCreateWithoutBookingsInput, DriverUncheckedCreateWithoutBookingsInput>
  }

  export type DriverReviewCreateWithoutBookingInput = {
    id?: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
    driver: DriverCreateNestedOneWithoutReviewsInput
  }

  export type DriverReviewUncheckedCreateWithoutBookingInput = {
    id?: string
    driverId: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
  }

  export type DriverReviewCreateOrConnectWithoutBookingInput = {
    where: DriverReviewWhereUniqueInput
    create: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
  }

  export type TaxiManagerUpsertWithoutBookingsInput = {
    update: XOR<TaxiManagerUpdateWithoutBookingsInput, TaxiManagerUncheckedUpdateWithoutBookingsInput>
    create: XOR<TaxiManagerCreateWithoutBookingsInput, TaxiManagerUncheckedCreateWithoutBookingsInput>
    where?: TaxiManagerWhereInput
  }

  export type TaxiManagerUpdateToOneWithWhereWithoutBookingsInput = {
    where?: TaxiManagerWhereInput
    data: XOR<TaxiManagerUpdateWithoutBookingsInput, TaxiManagerUncheckedUpdateWithoutBookingsInput>
  }

  export type TaxiManagerUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaxiManagerUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUpsertWithoutBookingsInput = {
    update: XOR<DriverUpdateWithoutBookingsInput, DriverUncheckedUpdateWithoutBookingsInput>
    create: XOR<DriverCreateWithoutBookingsInput, DriverUncheckedCreateWithoutBookingsInput>
    where?: DriverWhereInput
  }

  export type DriverUpdateToOneWithWhereWithoutBookingsInput = {
    where?: DriverWhereInput
    data: XOR<DriverUpdateWithoutBookingsInput, DriverUncheckedUpdateWithoutBookingsInput>
  }

  export type DriverUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviews?: DriverReviewUpdateManyWithoutDriverNestedInput
  }

  export type DriverUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviews?: DriverReviewUncheckedUpdateManyWithoutDriverNestedInput
  }

  export type DriverReviewUpsertWithoutBookingInput = {
    update: XOR<DriverReviewUpdateWithoutBookingInput, DriverReviewUncheckedUpdateWithoutBookingInput>
    create: XOR<DriverReviewCreateWithoutBookingInput, DriverReviewUncheckedCreateWithoutBookingInput>
    where?: DriverReviewWhereInput
  }

  export type DriverReviewUpdateToOneWithWhereWithoutBookingInput = {
    where?: DriverReviewWhereInput
    data: XOR<DriverReviewUpdateWithoutBookingInput, DriverReviewUncheckedUpdateWithoutBookingInput>
  }

  export type DriverReviewUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    driver?: DriverUpdateOneRequiredWithoutReviewsNestedInput
  }

  export type DriverReviewUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingCreateWithoutReviewInput = {
    id?: string
    userId: string
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    manager?: TaxiManagerCreateNestedOneWithoutBookingsInput
    driver?: DriverCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutReviewInput = {
    id?: string
    userId: string
    managerId?: string | null
    driverId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingCreateOrConnectWithoutReviewInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
  }

  export type DriverCreateWithoutReviewsInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutDriverInput
  }

  export type DriverUncheckedCreateWithoutReviewsInput = {
    id?: string
    firstName: string
    lastName: string
    phone: string
    vehicleType?: $Enums.VehicleType
    vehicleModel?: string | null
    licensePlate: string
    status?: $Enums.DriverStatus
    ratingAvg?: number
    ratingCount?: number
    totalTrips?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutDriverInput
  }

  export type DriverCreateOrConnectWithoutReviewsInput = {
    where: DriverWhereUniqueInput
    create: XOR<DriverCreateWithoutReviewsInput, DriverUncheckedCreateWithoutReviewsInput>
  }

  export type BookingUpsertWithoutReviewInput = {
    update: XOR<BookingUpdateWithoutReviewInput, BookingUncheckedUpdateWithoutReviewInput>
    create: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutReviewInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutReviewInput, BookingUncheckedUpdateWithoutReviewInput>
  }

  export type BookingUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    manager?: TaxiManagerUpdateOneWithoutBookingsNestedInput
    driver?: DriverUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverUpsertWithoutReviewsInput = {
    update: XOR<DriverUpdateWithoutReviewsInput, DriverUncheckedUpdateWithoutReviewsInput>
    create: XOR<DriverCreateWithoutReviewsInput, DriverUncheckedCreateWithoutReviewsInput>
    where?: DriverWhereInput
  }

  export type DriverUpdateToOneWithWhereWithoutReviewsInput = {
    where?: DriverWhereInput
    data: XOR<DriverUpdateWithoutReviewsInput, DriverUncheckedUpdateWithoutReviewsInput>
  }

  export type DriverUpdateWithoutReviewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutDriverNestedInput
  }

  export type DriverUncheckedUpdateWithoutReviewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    vehicleType?: EnumVehicleTypeFieldUpdateOperationsInput | $Enums.VehicleType
    vehicleModel?: NullableStringFieldUpdateOperationsInput | string | null
    licensePlate?: StringFieldUpdateOperationsInput | string
    status?: EnumDriverStatusFieldUpdateOperationsInput | $Enums.DriverStatus
    ratingAvg?: FloatFieldUpdateOperationsInput | number
    ratingCount?: IntFieldUpdateOperationsInput | number
    totalTrips?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutDriverNestedInput
  }

  export type BookingCreateManyManagerInput = {
    id?: string
    userId: string
    driverId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    driver?: DriverUpdateOneWithoutBookingsNestedInput
    review?: DriverReviewUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    review?: DriverReviewUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateManyWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    driverId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingCreateManyDriverInput = {
    id?: string
    userId: string
    managerId?: string | null
    fromAddress: string
    toAddress: string
    scheduledAt: Date | string
    disabilityType: $Enums.DisabilityType
    note?: string | null
    status?: $Enums.BookingStatus
    cancelReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DriverReviewCreateManyDriverInput = {
    id?: string
    bookingId: string
    userId: string
    rating: number
    comment?: string | null
    createdAt?: Date | string
  }

  export type BookingUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    manager?: TaxiManagerUpdateOneWithoutBookingsNestedInput
    review?: DriverReviewUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    review?: DriverReviewUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateManyWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    fromAddress?: StringFieldUpdateOperationsInput | string
    toAddress?: StringFieldUpdateOperationsInput | string
    scheduledAt?: DateTimeFieldUpdateOperationsInput | Date | string
    disabilityType?: EnumDisabilityTypeFieldUpdateOperationsInput | $Enums.DisabilityType
    note?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBookingStatusFieldUpdateOperationsInput | $Enums.BookingStatus
    cancelReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverReviewUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: BookingUpdateOneRequiredWithoutReviewNestedInput
  }

  export type DriverReviewUncheckedUpdateWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DriverReviewUncheckedUpdateManyWithoutDriverInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TaxiManagerCountOutputTypeDefaultArgs instead
     */
    export type TaxiManagerCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaxiManagerCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DriverCountOutputTypeDefaultArgs instead
     */
    export type DriverCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DriverCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaxiManagerDefaultArgs instead
     */
    export type TaxiManagerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaxiManagerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DriverDefaultArgs instead
     */
    export type DriverArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DriverDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BookingDefaultArgs instead
     */
    export type BookingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BookingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DriverReviewDefaultArgs instead
     */
    export type DriverReviewArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DriverReviewDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ManagerInviteDefaultArgs instead
     */
    export type ManagerInviteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ManagerInviteDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}