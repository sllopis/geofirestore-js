import { GeoFirestoreTypes } from './geofirestoretypes';
import { GeoQuery } from './query';
import { generateGeoQueryDocumentSnapshot, validateLocation } from './utils';

/**
 * A `GeoQuerySnapshot` contains zero or more `GeoDocumentSnapshot` objects
 * representing the results of a query. The documents can be accessed as an
 * array via the `docs` property or enumerated using the `forEach` method. The
 * number of documents can be determined via the `empty` and `size`
 * properties.
 */
export class GeoQuerySnapshot {
  private _center: GeoFirestoreTypes.cloud.GeoPoint;
  private _docs: GeoFirestoreTypes.QueryDocumentSnapshot[];

  /**
   * @param native The `QuerySnapshot` instance.
   * @param _queryCriteria The query criteria of geo based queries, includes field such as center, radius, and limit.
   */
  constructor(
    readonly native: GeoFirestoreTypes.cloud.QuerySnapshot | GeoFirestoreTypes.web.QuerySnapshot,
    private _queryCriteria?: GeoFirestoreTypes.QueryCriteria
  ) {

    if (_queryCriteria && _queryCriteria.center) {
      // Validate the center coordinates
      validateLocation(_queryCriteria.center);
      this._center = _queryCriteria.center;
    }

    this._docs = (native as GeoFirestoreTypes.cloud.QuerySnapshot).docs
      .map((snapshot: GeoFirestoreTypes.cloud.QueryDocumentSnapshot) => generateGeoQueryDocumentSnapshot(snapshot, this._center));
  }

  /**
   * The query on which you called `get` or `onSnapshot` in order to get this
   * `GeoQuerySnapshot`.
   */
  readonly query: GeoQuery = new GeoQuery(this.native.query, this._queryCriteria);

  /** An array of all the documents in the `QuerySnapshot`. */
  readonly docs: GeoFirestoreTypes.QueryDocumentSnapshot[] = this._docs;

  /** The number of documents in the `QuerySnapshot`. */
  readonly size: number = this._docs.length;

  /** True if there are no documents in the `QuerySnapshot`. */
  readonly empty: boolean = this._docs.length ? false : true;

  /**
   * Returns an array of the documents changes since the last snapshot. If
   * this is the first snapshot, all documents will be in the list as added
   * changes.
   */
  docChanges(): GeoFirestoreTypes.DocumentChange[] {
    const docChanges = Array.isArray(this.native.docChanges) ?
      this.native.docChanges as any as GeoFirestoreTypes.web.DocumentChange[]: this.native.docChanges();
    return (docChanges as GeoFirestoreTypes.web.DocumentChange[])
      .map((change: GeoFirestoreTypes.web.DocumentChange) => {
        return {
          doc: generateGeoQueryDocumentSnapshot(change.doc, this._center),
          newIndex: change.newIndex,
          oldIndex: change.oldIndex,
          type: change.type
        };
      });
  }

  /**
   * Enumerates all of the documents in the `GeoQuerySnapshot`.
   *
   * @param callback A callback to be called with a `GeoQueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg The `this` binding for the callback.
   */
  forEach(
    callback: (result: GeoFirestoreTypes.QueryDocumentSnapshot) => void,
    thisArg?: any
  ): void {
    this.docs.forEach(callback, thisArg);
  }

  /**
   * Returns true if this `GeoQuerySnapshot` is equal to the provided one.
   *
   * @param other The `GeoQuerySnapshot` to compare against.
   * @return true if this `GeoQuerySnapshot` is equal to the provided one.
   */
    isEqual(
      other: GeoQuerySnapshot | GeoFirestoreTypes.cloud.QuerySnapshot | GeoFirestoreTypes.web.QuerySnapshot
    ): boolean {
      if (other instanceof GeoQuerySnapshot) {
        return (this.native as GeoFirestoreTypes.cloud.QuerySnapshot)
          .isEqual(other.native as GeoFirestoreTypes.cloud.QuerySnapshot);
      }
      return (this.native as GeoFirestoreTypes.cloud.QuerySnapshot).isEqual(other as GeoFirestoreTypes.cloud.QuerySnapshot);
    }
}