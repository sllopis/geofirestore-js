import { GeoFirestoreTypes } from './geofirestoretypes';
import { GeoFirestore } from './firestore';
import { GeoJoinerGet, GeoJoinerOnSnapshot } from './joiner';
import { GeoQuerySnapshot } from './querysnapshot';
import { validateQueryCriteria, geohashQueries, validateLimit } from './utils';

/**
 * A `GeoQuery` refers to a GeoQuery which you can read or listen to. You can also
 * construct refined `GeoQuery` objects by adding filters and ordering.
 */
export class GeoQuery {
  private _center: GeoFirestoreTypes.cloud.GeoPoint | GeoFirestoreTypes.web.GeoPoint;
  private _limit: number;
  private _radius: number;
  private _isWeb: boolean;

  /**
   * @param native The `Query` instance.
   * @param queryCriteria The query criteria of geo based queries, includes field such as center, radius, and limit.
   */
  constructor(
    readonly native: GeoFirestoreTypes.cloud.Query | GeoFirestoreTypes.web.Query,
    queryCriteria?: GeoFirestoreTypes.QueryCriteria
  ) {
    if (Object.prototype.toString.call(native) !== '[object Object]') {
      throw new Error('Query must be an instance of a Firestore Query');
    }
    this._isWeb = Object.prototype.toString
      .call((native as GeoFirestoreTypes.web.CollectionReference).firestore.enablePersistence) === '[object Function]';
    if (queryCriteria) {
      if (queryCriteria.limit) {
        this._limit = queryCriteria.limit;
      }
      if (queryCriteria.center && queryCriteria.radius) {
        // Validate and save the query criteria
        validateQueryCriteria(queryCriteria);
        this._center = queryCriteria.center;
        this._radius = queryCriteria.radius;
      }
    }
  }

  /**
   * The `GeoFirestore` for the Firestore database (useful for performing
   * transactions, etc.).
   */
  readonly firestore: GeoFirestore = new GeoFirestore(this.native.firestore);

  /**
   * Executes the query and returns the results as a `GeoQuerySnapshot`.
   *
   * WEB CLIENT ONLY
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise that will be resolved with the results of the GeoQuery.
   */
  get(options: GeoFirestoreTypes.web.GetOptions = { source: 'default' }): Promise<GeoQuerySnapshot> {
    if (this._center && typeof this._radius !== 'undefined') {
      const queries = this._generateQuery().map((query) => this._isWeb ? query.get(options) : query.get());
      return Promise.all(queries).then(value => new GeoJoinerGet(value, this._queryCriteria).getGeoQuerySnapshot());
    } else {
      const query = this._limit ? this.native.limit(this._limit) : this.native;
      const promise = this._isWeb ? (query as GeoFirestoreTypes.web.Query).get(options) : (query as GeoFirestoreTypes.web.Query).get();
      return promise.then((snapshot) => new GeoQuerySnapshot(snapshot));
    }
  }

  /**
   * Returns true if this `GeoQuery` is equal to the provided one.
   *
   * @param other The `GeoQuery` to compare against.
   * @return true if this `GeoQuery` is equal to the provided one.
   */
  isEqual(
    other: GeoQuery | GeoFirestoreTypes.cloud.Query | GeoFirestoreTypes.web.Query
  ): boolean {
    if (other instanceof GeoQuery) {
      return (this.native as GeoFirestoreTypes.cloud.Query)
        .isEqual(other.native as GeoFirestoreTypes.cloud.Query);
    }
    return (this.native as GeoFirestoreTypes.cloud.Query).isEqual(other as GeoFirestoreTypes.cloud.Query);
  }

  /**
   * Creates and returns a new GeoQuery that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   * 
   * This function returns a new (immutable) instance of the GeoQuery
   * (rather than modify the existing instance) to impose the filter.
   *
   * Note: Limits on geoqueries are applied based on the distance from the
   * center. Geoqueries require an aggregation of queries. When performing
   * a geoquery the library applies the limit on the client. This may mean
   * you are loading to the client more documents then you intended. Use
   * with this performance limitation in mind.
   *
   * @param limit The maximum number of items to return.
   * @return The created GeoQuery.
   */
  limit(limit: number): GeoQuery {
    validateLimit(limit);
    this._limit = limit;
    return new GeoQuery(this.native, this._queryCriteria);
  }

  /**
   * Creates and returns a new GeoQuery with the geoquery filter where 
   * `get` and `onSnapshot` will query around.
   *
   * This function returns a new (immutable) instance of the GeoQuery
   * (rather than modify the existing instance) to impose the filter.
   *
   * @param newQueryCriteria The criteria which specifies the query's
   * center and radius.
   * @return The created GeoQuery.
   */
  near(newGeoQueryCriteria: GeoFirestoreTypes.QueryCriteria): GeoQuery {
    // Validate and save the new query criteria
    validateQueryCriteria(newGeoQueryCriteria);
    this._center = newGeoQueryCriteria.center || this._center;
    this._radius = newGeoQueryCriteria.radius || this._radius;

    return new GeoQuery(this.native, this._queryCriteria);
  }

  /**
   * Attaches a listener for GeoQuerySnapshot events.
   *
   * @param onNext A callback to be called every time a new `QuerySnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    onNext: (snapshot: GeoQuerySnapshot) => void,
    onError?: (error: Error) => void
  ): () => void {
    return (this.native as GeoFirestoreTypes.cloud.Query).onSnapshot(
      (snapshot: GeoFirestoreTypes.cloud.QuerySnapshot) => onNext(new GeoQuerySnapshot(snapshot)),
      (error: any) => { if (onError) { onError(error); } }
    );
  }

  /**
   * Creates and returns a new GeoQuery with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created GeoQuery.
   */
  where(
    fieldPath: string | GeoFirestoreTypes.cloud.FieldPath | GeoFirestoreTypes.web.FieldPath,
    opStr: GeoFirestoreTypes.WhereFilterOp,
    value: any
  ): GeoQuery {
    return new GeoQuery(this.native.where((fieldPath ? ('d.' + fieldPath) : fieldPath), opStr, value), this._queryCriteria);
  }

  /**
   * Creates an array of `Query` objects that query the appropriate
   * geohashes based on the radius and center GeoPoint of the query criteria.
   *
   * @return Array of Queries to search against.
   */
  private _generateQuery(): GeoFirestoreTypes.web.Query[] {
    // Get the list of geohashes to query
    let geohashesToQuery: string[] = geohashQueries(this._center, this._radius * 1000).map(this._queryToString);
    // Filter out duplicate geohashes
    geohashesToQuery = geohashesToQuery.filter((geohash: string, i: number) => geohashesToQuery.indexOf(geohash) === i);

    return geohashesToQuery.map((toQueryStr: string) => {
      // decode the geohash query string
      const query: string[] = this._stringToQuery(toQueryStr);
      // Create the Firebase query
      return this.native.orderBy('g').startAt(query[0]).endAt(query[1]) as GeoFirestoreTypes.web.Query;
    });
  }

  /**
   * Returns the center and radius of geo based queries as a
   * QueryCriteria object.
   */
  private get _queryCriteria(): GeoFirestoreTypes.QueryCriteria {
    return {
      center: this._center,
      limit: this._limit,
      radius: this._radius
    };
  }

  /**
   * Decodes a query string to a query
   *
   * @param str The encoded query.
   * @return The decoded query as a [start, end] pair.
   */
  private _stringToQuery(str: string): string[] {
    const decoded: string[] = str.split(':');
    if (decoded.length !== 2) {
      throw new Error('Invalid internal state! Not a valid geohash query: ' + str);
    }
    return decoded;
  }

  /**
   * Encodes a query as a string for easier indexing and equality.
   *
   * @param query The query to encode.
   * @return The encoded query as string.
   */
  private _queryToString(query: string[]): string {
    if (query.length !== 2) {
      throw new Error('Not a valid geohash query: ' + query);
    }
    return query[0] + ':' + query[1];
  }
}