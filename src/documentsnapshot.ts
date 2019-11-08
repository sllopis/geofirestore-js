import { GeoFirestoreTypes } from './geofirestoretypes';
import { GeoDocumentReference } from './documentreference';
import { decodeGeoDocumentData } from './utils';

/**
 * A `GeoDocumentSnapshot` contains data read from a document in your Firestore
 * database. The data can be extracted with `.data()` or `.get(<field>)` to
 * get a specific field.
 *
 * For a `GeoDocumentSnapshot` that points to a non-existing document, any data
 * access will return 'undefined'. You can use the `exists` property to
 * explicitly verify a document's existence.
 */
export class GeoDocumentSnapshot {
  /**
   * Flag if running firebase with web or node library.
   */
  private _isWeb: boolean;

  /**
   * @param native The `DocumentSnapshot` instance.
   */
  constructor(readonly native: GeoFirestoreTypes.cloud.DocumentSnapshot | GeoFirestoreTypes.web.DocumentSnapshot) {
    if (Object.prototype.toString.call(native) !== '[object Object]') {
      throw new Error('DocumentSnapshot must be an instance of a Firestore DocumentSnapshot');
    }
    this._isWeb = Object.prototype.toString
      .call((native as GeoFirestoreTypes.web.DocumentSnapshot).ref.firestore.enablePersistence) === '[object Function]';
  }

  /**
   * Property of the `GeoDocumentSnapshot` that signals whether or not the data
   * exists. True if the document exists.
   */
  readonly exists: boolean = this.native.exists;

  /**
   * The `GeoDocumentReference` for the document included in the `GeoDocumentSnapshot`.
   */
  readonly ref: GeoDocumentReference = new GeoDocumentReference(this.native.ref);

  /**
   * Property of the `GeoDocumentSnapshot` that provides the document's ID.
   */
  readonly id: string = this.native.id;

  /**
   * Retrieves all fields in the document as an Object. Returns 'undefined' if
   * the document doesn't exist.
   *
   * By default, `FieldValue.serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options An options object to configure how data is retrieved from
   * the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return An Object containing all fields in the document or 'undefined' if
   * the document doesn't exist.
   */
  data(options?: GeoFirestoreTypes.SnapshotOptions): GeoFirestoreTypes.DocumentData | undefined {
    const d = (this._isWeb && options) ? (this.native as GeoFirestoreTypes.web.DocumentSnapshot).data(options) : this.native.data();
    return (d) ? decodeGeoDocumentData(d as GeoFirestoreTypes.Document) : undefined;
  }

  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `FieldValue.serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
   * @param options An options object to configure how the field is retrieved
   * from the snapshot (e.g. the desired behavior for server timestamps that have
   * not yet been set to their final value).
   * @return The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  get(
    fieldPath: string | GeoFirestoreTypes.cloud.FieldPath | GeoFirestoreTypes.web.FieldPath,
    options?: GeoFirestoreTypes.SnapshotOptions
  ): any {
    const path = 'd.' + fieldPath;
    return (this._isWeb && options) ?
      (this.native as GeoFirestoreTypes.web.DocumentSnapshot).get(path, options) : this.native.get(path);
  }

  /**
   * Returns true if this `GeoDocumentSnapshot` is equal to the provided one.
   *
   * @param other The `GeoDocumentSnapshot` to compare against.
   * @return true if this `GeoDocumentSnapshot` is equal to the provided one.
   */
  isEqual(other: GeoDocumentSnapshot | GeoFirestoreTypes.cloud.DocumentSnapshot | GeoFirestoreTypes.web.DocumentSnapshot): boolean {
    if (other instanceof GeoDocumentSnapshot) {
      return (this.native as GeoFirestoreTypes.cloud.DocumentSnapshot)
        .isEqual(other.native as GeoFirestoreTypes.cloud.DocumentSnapshot);
    }
    return (this.native as GeoFirestoreTypes.cloud.DocumentSnapshot).isEqual(other as GeoFirestoreTypes.cloud.DocumentSnapshot);
  }
}