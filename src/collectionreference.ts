import { GeoFirestoreTypes } from './geofirestoretypes';
import { GeoDocumentReference } from './documentreference';
import { GeoQuery } from './query';
import { findCoordinates, encodeGeohash, encodeGeoDocument } from './utils';

/**
 * A `GeoCollectionReference` object can be used for adding documents, getting
 * document references, and querying for documents (using the methods
 * inherited from `GeoQuery`).
 */
export class GeoCollectionReference extends GeoQuery {
  /**
   * @param native The `CollectionReference` instance.
   */
  constructor(readonly native: GeoFirestoreTypes.cloud.CollectionReference | GeoFirestoreTypes.web.CollectionReference) {
    super(native);
  }

  /** The collection's identifier. */
  readonly id: string = this.native.id;

  /**
   * A reference to the containing `GeoDocumentReference` if this is a subcollection.
   * If this isn't a subcollection, the reference is null.
   */
  readonly parent: GeoDocumentReference | null = this.native.parent ? new GeoDocumentReference(this.native.parent) : null;

  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  readonly path: string = this.native.path;

  /**
   * Add a new document to this collection with the specified data, assigning
   * it a document ID automatically.
   *
   * @param data An Object containing the data for the new document.
   * @param customKey The key of the document to use as the location. Otherwise
   * we default to `coordinates`.
   * @return A Promise resolved with a `GeoDocumentReference` pointing to the
   * newly created document after it has been written to the backend.
   */
  add(
    data: GeoFirestoreTypes.DocumentData,
    customKey?: string
  ): Promise<GeoDocumentReference> {
    if (Object.prototype.toString.call(data) === '[object Object]') {
      const location = findCoordinates(data, customKey);
      const geohash: string = encodeGeohash(location);
      return (this.native as GeoFirestoreTypes.cloud.CollectionReference)
        .add(encodeGeoDocument(location, geohash, data)).then((doc) => new GeoDocumentReference(doc));
    } else {
      throw new Error('document must be an object');
    }
  }

  /**
   * Get a `GeoDocumentReference` for the document within the collection at the
   * specified path. If no path is specified, an automatically-generated
   * unique ID will be used for the returned GeoDocumentReference.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `GeoDocumentReference` instance.
   */
  doc(documentPath?: string): GeoDocumentReference {
    return (documentPath) ? new GeoDocumentReference(this.native.doc(documentPath)) : new GeoDocumentReference(this.native.doc());
  }

  /**
   * Returns true if this `GeoCollectionReference` is equal to the provided one.
   *
   * @param other The `GeoCollectionReference` to compare against.
   * @return true if this `GeoCollectionReference` is equal to the provided one.
   */
  isEqual(
    other: GeoCollectionReference | GeoFirestoreTypes.cloud.CollectionReference | GeoFirestoreTypes.web.CollectionReference
  ): boolean {
    if (other instanceof GeoCollectionReference) {
      return (this.native as GeoFirestoreTypes.cloud.CollectionReference)
        .isEqual(other.native as GeoFirestoreTypes.cloud.CollectionReference);
    }
    return (this.native as GeoFirestoreTypes.cloud.CollectionReference).isEqual(other as GeoFirestoreTypes.cloud.CollectionReference);
  }
}
