import { GeoFirestoreTypes } from './geofirestoretypes';
import { encodeSetDocument, encodeUpdateDocument, sanitizeSetOptions } from './utils';
import { GeoDocumentReference } from './documentreference';

/**
 * A write batch, used to perform multiple writes as a single atomic unit.
 *
 * A `GeoWriteBatch` object can be acquired by calling `Firestore.batch()`. It
 * provides methods for adding writes to the write batch. None of the
 * writes will be committed (or visible locally) until `GeoWriteBatch.commit()`
 * is called.
 *
 * Unlike transactions, write batches are persisted offline and therefore are
 * preferable when you don't need to condition your writes on read data.
 */
export class GeoWriteBatch {
  constructor(readonly native: GeoFirestoreTypes.cloud.WriteBatch | GeoFirestoreTypes.web.WriteBatch) {
    if (Object.prototype.toString.call(native) !== '[object Object]') {
      throw new Error('WriteBatch must be an instance of a Firestore WriteBatch');
    }
  }

  /**
   * Commits all of the writes in this write batch as a single atomic unit.
   *
   * @return A Promise resolved once all of the writes in the batch have been
   * successfully written to the backend as an atomic unit. Note that it won't
   * resolve while you're offline.
   */
  commit(): Promise<void> {
    return (this.native.commit() as Promise<any>).then(() => {});
  }

  /**
   * Deletes the document referred to by the provided `GeoDocumentReference`.
   *
   * @param documentRef A reference to the document to be deleted.
   * @return This `GeoWriteBatch` instance. Used for chaining method calls.
   */
  delete(
    documentRef: GeoDocumentReference | GeoFirestoreTypes.cloud.DocumentReference | GeoFirestoreTypes.web.DocumentReference
  ): GeoWriteBatch {
    const ref = ((documentRef instanceof GeoDocumentReference) ?
      documentRef.native : documentRef) as GeoFirestoreTypes.cloud.DocumentReference;
    (this.native as GeoFirestoreTypes.cloud.WriteBatch).delete(ref);
    return this;
  }

  /**
   * Writes to the document referred to by the provided `GeoDocumentReference`.
   * If the document does not exist yet, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into the existing document.
   *
   * @param documentRef A reference to the document to be set.
   * @param data An object of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return This `GeoWriteBatch` instance. Used for chaining method calls.
   */
  set(
    documentRef: GeoDocumentReference | GeoFirestoreTypes.cloud.DocumentReference | GeoFirestoreTypes.web.DocumentReference,
    data: GeoFirestoreTypes.DocumentData,
    options?: GeoFirestoreTypes.SetOptions
  ): GeoWriteBatch {
    const ref = ((documentRef instanceof GeoDocumentReference) ?
      documentRef.native : documentRef) as GeoFirestoreTypes.cloud.DocumentReference;
    (this.native as GeoFirestoreTypes.cloud.WriteBatch).set(
      ref,
      encodeSetDocument(data, options),
      sanitizeSetOptions(options)
    );
    return this;
  }

  /**
   * Updates fields in the document referred to by the provided
   * `GeoDocumentReference`. The update will fail if applied to a document that
   * does not exist.
   *
   * @param documentRef A reference to the document to be updated.
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @return This `GeoWriteBatch` instance. Used for chaining method calls.
   */
  update(
    documentRef: GeoDocumentReference | GeoFirestoreTypes.cloud.DocumentReference | GeoFirestoreTypes.web.DocumentReference,
    data: GeoFirestoreTypes.UpdateData,
    customKey?: string
  ): GeoWriteBatch {
    const ref = ((documentRef instanceof GeoDocumentReference) ?
      documentRef.native : documentRef) as GeoFirestoreTypes.cloud.DocumentReference;
    (this.native as GeoFirestoreTypes.cloud.WriteBatch).update(ref, encodeUpdateDocument(data, customKey));
    return this;
  }
}