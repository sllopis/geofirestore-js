import { GeoFirestoreTypes } from './geofirestoretypes';
import { encodeSetDocument, encodeUpdateDocument, sanitizeSetOptions } from './utils';
import { GeoCollectionReference } from './collectionreference';
import { GeoDocumentSnapshot } from './documentsnapshot';
import { GeoFirestore } from './firestore';

/**
 * A `GeoDocumentReference` refers to a document location in a Firestore database
 * and can be used to write, read, or listen to the location. The document at
 * the referenced location may or may not exist. A `GeoDocumentReference` can
 * also be used to create a `GeoCollectionReference` to a subcollection.
 */
export class GeoDocumentReference {
  /**
   * Flag if running firebase with web or node library.
   */
  private _isWeb: boolean;

  /**
   * @param native The `DocumentReference` instance.
   */
  constructor(readonly native: GeoFirestoreTypes.cloud.DocumentReference | GeoFirestoreTypes.web.DocumentReference) {
    if (Object.prototype.toString.call(native) !== '[object Object]') {
      throw new Error('DocumentReference must be an instance of a Firestore DocumentReference');
    }
    this._isWeb = Object.prototype.toString
      .call((native as GeoFirestoreTypes.web.DocumentReference).firestore.enablePersistence) === '[object Function]';
  }

  /**
   * The document's identifier within its collection.
   */
  readonly id: string = this.native.id;

  /**
   * The GeoFirestore the document is in.
   * This is useful for performing transactions, for example.
   */
  readonly firestore: GeoFirestore = new GeoFirestore(this.native.firestore);

  /**
   * The GeoCollection this `GeoDocumentReference` belongs to.
   */
  readonly parent: GeoCollectionReference = new GeoCollectionReference(this.native.parent);

  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  readonly path: string = this.native.path;

  /**
   * Gets a `GeoCollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `GeoCollectionReference` instance.
   */
  collection(collectionPath: string): GeoCollectionReference {
    return new GeoCollectionReference(this.native.collection(collectionPath));
  }

  /**
   * Deletes the document referred to by this `GeoDocumentReference`.
   *
   * @return A Promise resolved once the document has been successfully
   * deleted from the backend (Note that it won't resolve while you're
   * offline).
   */
  delete(): Promise<void> {
    return (this.native as GeoFirestoreTypes.web.DocumentReference).delete().then(() => { return; });
  }

  /**
   * Reads the document referred to by this `GeoDocumentReference`.
   *
   * Note: By default, get() attempts to provide up-to-date data when possible
   * by waiting for data from the server, but it may return cached data or fail
   * if you are offline and the server cannot be reached. This behavior can be
   * altered via the `GetOptions` parameter.
   *
   * @param options An object to configure the get behavior.
   * @return A Promise resolved with a GeoDocumentSnapshot containing the
   * current document contents.
   */
  get(options: GeoFirestoreTypes.web.GetOptions = { source: 'default' }): Promise<GeoDocumentSnapshot> {
    return this._isWeb ?
      (this.native as GeoFirestoreTypes.web.DocumentReference).get(options).then((snapshot: any) => new GeoDocumentSnapshot(snapshot)) :
      (this.native as GeoFirestoreTypes.cloud.DocumentReference).get().then((snapshot: any) => new GeoDocumentSnapshot(snapshot));
  }

  /**
   * Returns true if this `GeoDocumentReference` is equal to the provided one.
   *
   * @param other The `GeoDocumentReference` to compare against.
   * @return true if this `GeoDocumentReference` is equal to the provided one.
   */
  isEqual(
    other: GeoDocumentReference | GeoFirestoreTypes.cloud.DocumentReference | GeoFirestoreTypes.web.DocumentReference
  ): boolean {
    if (other instanceof GeoDocumentReference) {
      return (this.native as GeoFirestoreTypes.cloud.DocumentReference)
        .isEqual(other.native as GeoFirestoreTypes.cloud.DocumentReference);
    }
    return (this.native as GeoFirestoreTypes.cloud.DocumentReference).isEqual(other as GeoFirestoreTypes.cloud.DocumentReference);
  }

  /**
   * Attaches a listener for GeoDocumentSnapshot events.
   *
   * @param onNext A callback to be called every time a new `GeoDocumentSnapshot`
   * is available.
   * @param onError A callback to be called if the listen fails or is
   * cancelled. No further callbacks will occur.
   * @return An unsubscribe function that can be called to cancel
   * the snapshot listener.
   */
  onSnapshot(
    onNext: (snapshot: GeoDocumentSnapshot) => void,
    onError?: (error: Error) => void
  ): () => void {
    return (this.native as GeoFirestoreTypes.web.DocumentReference).onSnapshot(
      (snapshot: GeoFirestoreTypes.web.DocumentSnapshot) => onNext(new GeoDocumentSnapshot(snapshot)),
      (error: any) => { if (onError) { onError(error); } }
    );
  }

  /**
   * Writes to the document referred to by this `GeoDocumentReference`. If the
   * document does not yet exist, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into an existing document.
   *
   * @param data A map of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  set(data: GeoFirestoreTypes.DocumentData, options?: GeoFirestoreTypes.SetOptions): Promise<void> {
    return (this.native as GeoFirestoreTypes.web.DocumentReference).set(
      encodeSetDocument(data, options), 
      sanitizeSetOptions(options)
    ).then(() => { return; });
  }

  /**
   * Updates fields in the document referred to by this `GeoDocumentReference`.
   * The update will fail if applied to a document that does not exist.
   *
   * @param data An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @param customKey The key of the document to use as the location. Otherwise
   * we default to `coordinates`.
   * @return A Promise resolved once the data has been successfully written
   * to the backend (Note that it won't resolve while you're offline).
   */
  update(data: GeoFirestoreTypes.UpdateData, customKey?: string): Promise<void> {
    return (this.native as GeoFirestoreTypes.web.DocumentReference).update(encodeUpdateDocument(data, customKey)).then(() => {});
  }
}